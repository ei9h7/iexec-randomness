import json
import os
import sys
from generator import create_randomness

iexec_out = os.getenv("IEXEC_OUT")


def parse_iexec_args(a):
    if len(a) > 1:
        try:
            return int(a[1]), a[2:]
        except IndexError:
            return a[1], []
        except ValueError:
            pass
    return None, []


def add_callback(ri, rv):
    callback_error = "".zfill(64)
    try:
        int(ri, 16)  # verify hex
        int(rv, 16)
        if len(ri) != 64 or len(rv) != 64:
            raise Exception
        cb = f'0x{ri}{rv}'
    except (ValueError, TypeError, Exception):
        cb = f'0x{callback_error}{callback_error}'

    with open(f'{iexec_out}/computed.json', 'w+') as f:
        json.dump({"callback-data": cb}, f)


if __name__ == '__main__':
    randomness_key, args = parse_iexec_args(sys.argv)
    randomness_id, random_result = create_randomness(randomness_key, args)
    add_callback(randomness_id, random_result)
