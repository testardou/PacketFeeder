import { createBrowserRouter, Navigate } from "react-router-dom";

// import Layout from "@/layouts/Layout";
import Replay from "@/pages/Replay";
import Live from "@/pages/Live";
import Layout from "../layouts/Layout";
import { Files } from "@/components/files/Files";

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
        element: <Replay />,
      },
      {
        path: "live",
        element: <Live />,
      },
    ],
  },
]);
