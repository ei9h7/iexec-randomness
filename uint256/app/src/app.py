import json
import os
import secrets

iexec_out = os.getenv("IEXEC_OUT")


def create_callback(r):
    try:
        int(r, 16)  # verify hex
        if len(r) != 64:
            raise Exception
        return f'0x{r}'
    except (ValueError, TypeError, Exception):
        callback_error = "".zfill(64)
        return f'0x{callback_error}'


def write_callback(cb):
    with open(f'{iexec_out}/computed.json', 'w+') as f:
        json.dump({"callback-data": cb}, f)


if __name__ == '__main__':
    randomness = secrets.token_hex(32)
    callback = create_callback(randomness)
    write_callback(callback)
