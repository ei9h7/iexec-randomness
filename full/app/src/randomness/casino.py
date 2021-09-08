import secrets


def lotto(args):
    # defaults as keno
    # SC can have a regular claim and a sorted claim function if user picks balls out of order
    max_balls = 255  # FF = 255
    default_balls = 80
    max_picks = 32
    default_picks = 20

    try:
        balls = default_balls if int(args[0]) > max_balls or int(args[0]) <= 0 else int(args[0])
        picks = default_picks if int(args[1]) > max_picks or int(args[1]) <= 0 else int(args[1])
        if picks > balls:
            raise ValueError
    except (IndexError, TypeError, ValueError):
        balls = default_balls
        picks = default_picks

    ball_values = list(range(1, balls + 1))

    random_draw = []
    for i in range(picks):
        random_pick = secrets.choice(ball_values)
        random_draw.append(random_pick)
        ball_values.remove(random_pick)

    # order does not matter in lotto/keno
    lotto_draw = sorted(random_draw)

    random_draw_hex = ''.join(f'{b:02x}' for b in lotto_draw).zfill(64)

    return [balls, picks], random_draw_hex


def roulette(args):
    max_spins = 32
    numbers = 36  # 0-36, 37 could be 00

    try:
        spins = max_spins if int(args[0]) > max_spins or int(args[0]) <= 0 else int(args[0])

    except (IndexError, TypeError, ValueError):
        spins = max_spins

    return [spins], ''.join(f'{secrets.randbelow(numbers+1):02x}' for _ in range(spins)).zfill(64)


def lotto_powerball(args):
    max_balls = 255  # FF = 255
    default_balls = 69
    max_picks = 31  # last space used for powerball
    default_picks = 5
    max_powerballs = 255
    default_powerballs = 26

    try:
        balls = default_balls if int(args[0]) > max_balls or int(args[0]) <= 0 else int(args[0])
        picks = default_picks if int(args[1]) > max_picks or int(args[1]) <= 0 else int(args[1])
        powerballs = default_powerballs if int(args[2]) > max_powerballs or int(args[2]) <= 0 else int(args[2])
        if picks > balls:
            raise ValueError
    except (IndexError, TypeError, ValueError):
        balls = default_balls
        picks = default_picks
        powerballs = default_powerballs

    ball_values = list(range(1, balls + 1))

    random_draw = []
    for i in range(picks):
        random_pick = secrets.choice(ball_values)
        random_draw.append(random_pick)
        ball_values.remove(random_pick)

    lotto_draw = sorted(random_draw)

    # draw power ball and move to front
    random_powerball = secrets.choice(list(range(1, powerballs + 1)))
    lotto_draw.append(random_powerball)

    random_draw_hex = ''.join(f'{b:02x}' for b in lotto_draw).zfill(64)

    return [balls, picks, powerballs], random_draw_hex.zfill(64)
