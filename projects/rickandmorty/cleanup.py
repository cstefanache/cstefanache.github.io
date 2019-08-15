import glob
import os
import re

for filename in os.listdir("./transcripts"):
    with open("./transcripts/" + filename, "r") as f:
        content = f.read()
        if (len(content) > 0):
            content_new = re.sub('^(?:[\t ]*(?:\r?\n|\r))+','', content, flags = re.M)
            newFile = open(r'./parsed/'+filename,"w+")
            newFile.write(content_new.lower())
            newFile.close()

