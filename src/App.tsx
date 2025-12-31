import { Routes, Route } from "react-router-dom";
import { appRoutes, Route as RouteInterface } from "./config/site";

function renderRoutes(routes: RouteInterface[]) {
  return routes.map((route: RouteInterface) => {
    if (route.children) {
      return (
        <Route key={route.name} path={route.path} element={route.element}>
          {renderRoutes(route.children)}
        </Route>
      );
    }

    return (
      <Route
        key={route.name}
        path={route.path}
        element={route.element}
      />
    );
  });
}

function App() {
  return (
    <Routes>
      {renderRoutes(appRoutes)}
    </Routes>
  );
}

export default App;
