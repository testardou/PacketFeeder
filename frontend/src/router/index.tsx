import { createBrowserRouter, Navigate } from "react-router-dom";

import Replay from "@/pages/Replay";
import Live from "@/pages/Live";
import ScenarioBuilder from "@/pages/ScenarioBuilder";
import Layout from "../layouts/Layout";
import { Files } from "@/pages/Files";
import Mitre from "@/pages/Mitre";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/replay" replace />,
      },
      {
        path: "files",
        element: <Files />,
      },
      {
        path: "replay",
        element: <Replay />,
      },
      {
        path: "Mitre",
        element: <Mitre />,
      },
      {
        path: "scenario",
        element: <ScenarioBuilder />,
      },
      {
        path: "live",
        element: <Live />,
      },
    ],
  },
]);
