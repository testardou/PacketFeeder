import { createBrowserRouter, Navigate } from "react-router-dom";

// import Layout from "@/layouts/Layout";
import Replay from "@/pages/Replay";
import Live from "@/pages/Live";
import Scenarios from "@/pages/Scenarios";
import ChainBuilder from "@/pages/ChainBuilder";
import Layout from "../layouts/Layout";
import { Files } from "@/pages/Files";

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
        path: "Scenarios",
        element: <Scenarios />,
      },
      {
        path: "chain-builder",
        element: <ChainBuilder />,
      },
      {
        path: "live",
        element: <Live />,
      },
    ],
  },
]);
