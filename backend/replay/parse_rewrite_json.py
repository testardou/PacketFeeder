import json

def parse_rewrite_json(json_string):
    mapping = {}

    if not json_string:
        return mapping

    rules = json.loads(json_string)

    for rule in rules:
        old = rule.get("old")
        new = rule.get("new")

        if not old or not new:
            raise ValueError("Rewrite rule must include 'old' and 'new'.")

        mapping[old.strip()] = new.strip()

    print('TOTOTOTOTOTO', mapping)
    return mapping