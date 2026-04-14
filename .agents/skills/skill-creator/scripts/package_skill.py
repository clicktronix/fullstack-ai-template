#!/usr/bin/env python3
"""
Skill Packager - Creates distributable .skill files from skill folders

Usage:
    package_skill.py <path/to/skill-folder> [output-directory]

Examples:
    package_skill.py ./my-skill
    package_skill.py ./my-skill ./dist
"""

import sys
import zipfile
from pathlib import Path

# Import the validator
try:
    from quick_validate import validate_skill
except ImportError:
    # Try relative import if running from different directory
    import importlib.util
    spec = importlib.util.spec_from_file_location(
        "quick_validate",
        Path(__file__).parent / "quick_validate.py"
    )
    quick_validate = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(quick_validate)
    validate_skill = quick_validate.validate_skill


def package_skill(skill_path, output_dir=None):
    """
    Package a skill directory into a distributable .skill file.

    Args:
        skill_path: Path to the skill directory
        output_dir: Optional output directory for the .skill file

    Returns:
        Path to created .skill file, or None if error
    """
    skill_path = Path(skill_path).resolve()

    # Validate skill path exists
    if not skill_path.exists():
        print(f"Error: Skill path does not exist: {skill_path}")
        return None

    if not skill_path.is_dir():
        print(f"Error: Skill path is not a directory: {skill_path}")
        return None

    # Check SKILL.md exists
    skill_md = skill_path / 'SKILL.md'
    if not skill_md.exists():
        print(f"Error: SKILL.md not found in {skill_path}")
        return None

    # Run validation
    print(f"Validating skill: {skill_path.name}")
    valid, message = validate_skill(skill_path)
    if not valid:
        print(f"Validation failed: {message}")
        return None
    print(f"Validation passed: {message}")

    # Determine output directory
    if output_dir:
        output_path = Path(output_dir).resolve()
        output_path.mkdir(parents=True, exist_ok=True)
    else:
        output_path = skill_path.parent

    # Create .skill file (ZIP archive)
    skill_name = skill_path.name
    skill_file = output_path / f"{skill_name}.skill"

    print(f"Packaging skill: {skill_name}")

    try:
        with zipfile.ZipFile(skill_file, 'w', zipfile.ZIP_DEFLATED) as zf:
            # Walk through all files in the skill directory
            for file_path in skill_path.rglob('*'):
                if file_path.is_file():
                    # Calculate relative path within the archive
                    arcname = file_path.relative_to(skill_path.parent)
                    zf.write(file_path, arcname)
                    print(f"  Added: {arcname}")

        print(f"\nPackage created: {skill_file}")
        return skill_file

    except Exception as e:
        print(f"Error creating package: {e}")
        return None


def main():
    if len(sys.argv) < 2:
        print("Usage: package_skill.py <path/to/skill-folder> [output-directory]")
        print("\nExamples:")
        print("  package_skill.py ./my-skill")
        print("  package_skill.py ./my-skill ./dist")
        sys.exit(1)

    skill_path = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else None

    result = package_skill(skill_path, output_dir)

    if result:
        sys.exit(0)
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
