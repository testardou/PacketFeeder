def parse_mapping(rules_list):
    mapping = {}
    if not rules_list:
        return mapping

    for rule in rules_list:
        if "=" not in rule:
            raise ValueError(f"Invalid mapping '{rule}'. Use old=new format.")

        old, new = rule.split("=", 1)
        mapping[old.strip().lower()] = new.strip().lower()

    return mapping