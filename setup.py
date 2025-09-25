import os
import sys
import subprocess


def main() -> int:
    # Create venv and install deps
    py = sys.executable
    if not os.path.exists('.venv'):
        subprocess.check_call([py, '-m', 'venv', '.venv'])
    pip = os.path.join('.venv', 'Scripts' if os.name == 'nt' else 'bin', 'pip')
    subprocess.check_call([pip, 'install', '--upgrade', 'pip', 'wheel', 'setuptools'])
    subprocess.check_call([pip, 'install', '-r', 'requirements.txt'])
    print('Setup complete.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())



