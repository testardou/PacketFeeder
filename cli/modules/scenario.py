from cli.modules.base import BaseModule


class ScenarioModule(BaseModule):
    name = "mitre"
    description = "Build and replay attack scenarios by chaining MITRE technique PCAPs"

    def __init__(self):
        super().__init__()