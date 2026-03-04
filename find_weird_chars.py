import os
import sys

def find_encoding_issues(directory):
    for root, d_names, f_names in os.walk(directory):
        if "node_modules" in d_names:
            d_names.remove("node_modules")
        if ".next" in d_names:
            d_names.remove(".next")
        for f in f_names:
            if not f.endswith((".ts", ".tsx", ".js", ".jsx", ".md")): continue
            path = os.path.join(root, f)
            try:
                with open(path, 'r', encoding='utf-8') as file:
                    content = file.read()
                    # Let's find exactly any non-ascii strings around words
                    for idx, line in enumerate(content.split('\n')):
                        has_strange = False
                        for char in line:
                            # Is non-ascii
                            if ord(char) > 127:
                                # Is not a standard spanish char or bullet or degree or dash or nbsp
                                if char not in 'áéíóúÁÉÍÓÚñÑüÜ¿¡•·°–— \u00A0':
                                    has_strange = True
                                    print(f"File: {path}, Line: {idx+1}")
                                    print(f"Char: {repr(char)}")
                                    print(f"Content: {line.strip()}")
                                    break
            except UnicodeDecodeError:
                print(f"Decode error on {path}")

if __name__ == "__main__":
    find_encoding_issues("c:/Users/CANVAS HALLANDALE 3/Downloads/Proyectos/cops-platform/cops-platform/apps/cotizaciones")
