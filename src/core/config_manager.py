import os
from typing import Any, Dict

import yaml
from dotenv import dotenv_values


def _read_yaml_file(path: str) -> Dict[str, Any]:
    if not os.path.exists(path):
        return {}
    with open(path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f) or {}


def _merge_dicts(base: Dict[str, Any], override: Dict[str, Any]) -> Dict[str, Any]:
    result: Dict[str, Any] = dict(base)
    for key, value in override.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = _merge_dicts(result[key], value)
        else:
            result[key] = value
    return result


def _env_file_name(app_env: str) -> str:
    return f".env.{app_env}"


def load_runtime_config() -> Dict[str, Any]:
    # Low -> High precedence:
    # config.yaml -> .env.example defaults -> .env.<APP_ENV> -> process env
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
    config_yaml_path = os.path.join(repo_root, 'config.yaml')
    example_env_path = os.path.join(repo_root, '.env.example')

    base_config = _read_yaml_file(config_yaml_path)

    # .env precedence based on APP_ENV
    app_env = os.getenv('APP_ENV', 'local')
    env_file_path = os.path.join(repo_root, _env_file_name(app_env))

    example_env = dotenv_values(example_env_path) if os.path.exists(example_env_path) else {}
    env_file = dotenv_values(env_file_path) if os.path.exists(env_file_path) else {}

    # Start with YAML
    config: Dict[str, Any] = dict(base_config)

    # Apply .env.example as defaults under top-level keys if they look like SCREAMING_SNAKE
    for k, v in example_env.items():
        config.setdefault('env', {})[k] = v

    # Apply .env.<APP_ENV>
    for k, v in env_file.items():
        config.setdefault('env', {})[k] = v

    # Apply process env last
    for k, v in os.environ.items():
        if k.startswith('CN_') or k in {'APP_ENV'}:
            config.setdefault('env', {})[k] = v

    return config




