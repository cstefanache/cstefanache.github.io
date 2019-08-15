import glob
import os
import re

characters = {}

def parse(name, line):
    try:
        character = characters[name]
    except KeyError:
        character = characters[name] = {'count': 0}    
    character['count'] += 1

for filename in os.listdir("./parsed"):
    with open("./parsed/" + filename, "r") as f:
        for line in f:            
            name = re.search(r"^([a-z0-9 \(\)]+):", line)
            if name:
                name = name.group(1).strip()
                parse(name, line)

print(characters)
