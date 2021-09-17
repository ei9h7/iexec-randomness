from hashlib import sha256
from randomness import core
from randomness import casino
from randomness import game

randomness = {
    1: core.random_hex,
    2: core.random_below,
    3: core.random_bits,
    4: core.random_choice_hex,
    20: game.dice,
    21: game.coin,
    50: casino.lotto,
    51: casino.lotto_powerball,
    52: casino.roulette

}

default_randomness_key = 1


def create_randomness_id(randomness_key, args):
    # args are stored as a string from iexec_args (ex. "1 256")
    randomness_id_string = str(randomness_key)
    if args:
        randomness_id_string += ' '
        randomness_id_string += ' '.join(str(e) for e in args)
    randomness_id = sha256()
    randomness_id.update(randomness_id_string.encode('utf-8'))

    return randomness_id.hexdigest()


def create_randomness(randomness_key, user_args):
    try:
        # need default args defined in each function to create proper id
        args, random_result = randomness[randomness_key](user_args)
        return create_randomness_id(randomness_key, args), random_result
    except (IndexError, TypeError, ValueError, KeyError):
        args, random_result = randomness[default_randomness_key]([])
        return create_randomness_id(default_randomness_key, args), random_result
