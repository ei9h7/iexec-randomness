import secrets


def random_hex(args):
    max_bytes = 32

    try:
        _bytes = max_bytes if int(args[0]) > max_bytes or int(args[0]) <= 0 else int(args[0])
    except (IndexError, TypeError, ValueError):
        _bytes = max_bytes

    return [_bytes], f'{secrets.token_hex(_bytes).zfill(64)}'


def random_below(args):
    max_bits = 256

    try:
        bits = max_bits if int(args[0]) > max_bits or int(args[0]) <= 0 else int(args[0])
    except (IndexError, TypeError, ValueError):
        bits = max_bits

    return [bits], f'{secrets.randbelow(2 ** bits):064x}'


def random_bits(args):
    max_bits = 256

    try:
        bits = max_bits if int(args[0]) > max_bits or int(args[0]) <= 0 else int(args[0])
    except (IndexError, TypeError, ValueError):
        bits = max_bits

    return [bits], f'{secrets.randbits(bits):064x}'


def random_choice_hex(args):
    max_hex = 64

    try:
        hex_len = max_hex if int(args[0]) > max_hex or int(args[0]) <= 0 else int(args[0])
    except (IndexError, TypeError, ValueError):
        hex_len = max_hex

    # int = int(hex_string, 16)
    return [hex_len], ''.join(secrets.choice('0123456789abcdef') for _ in range(hex_len)).zfill(64)
