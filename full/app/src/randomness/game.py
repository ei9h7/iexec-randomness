import secrets


def coin(args):
    max_flips = 32
    values = [1, 2]

    try:
        flips = max_flips if int(args[0]) > max_flips or int(args[0]) <= 0 else int(args[0])
    except (IndexError, TypeError, ValueError):
        flips = max_flips

    return [flips], ''.join(f'{secrets.choice(values):02x}' for _ in range(flips)).zfill(64)


def dice(args):
    max_sides = 99
    default_sides = 6
    max_rolls = 32

    try:
        sides = default_sides if int(args[0]) > max_sides or int(args[0]) <= 0 else int(args[0])
        rolls = max_rolls if int(args[1]) > max_rolls or int(args[1]) <= 0 else int(args[1])
    except (IndexError, TypeError, ValueError):
        sides = default_sides
        rolls = max_rolls

    values = list(range(1, sides + 1))

    return [sides, rolls], ''.join(f'{secrets.choice(values):02x}' for _ in range(rolls)).zfill(64)


def number(args):
    # "pick a number between one and a million" allows for 1 and million
    max_number = 1000000

    try:
        num = max_number if int(args[0]) > max_number or int(args[0]) <= 0 else int(args[0])
    except (IndexError, TypeError, ValueError):
        num = max_number

    num += 1  # allows max to be included in range

    random_num = 0  # prevent 0
    while random_num != 0:
        random_num = secrets.randbelow(num)

    return [num], f'{random_num:064x}'
