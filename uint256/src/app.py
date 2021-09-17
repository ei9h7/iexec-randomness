import json
import os
import secrets
import hashlib

iexec_out = os.getenv("IEXEC_OUT")


def add_callback(r):
    try:
        int(r, 16)  # verify hex
        if len(r) != 64:
            raise Exception
        cb = f'0x{r}'
    except (ValueError, TypeError, Exception):
        callback_error = "".zfill(64)
        cb = f'0x{callback_error}'

    with open(f'{iexec_out}/computed.json', 'w+') as f:
        json.dump({"callback-data": cb}, f)


if __name__ == '__main__':
    """SHA-256 hash of 32 bytes (256 bits) of randomness using secrets module
    https://docs.python.org/3/library/secrets.html
    
    """

    randomness = hashlib.sha256(secrets.token_bytes(32)).hexdigest()
    add_callback(randomness)
