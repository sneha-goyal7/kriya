import AppRoutes from "@/routes/AppRoutes";
import PersistLogin from "@/routes/guards/PersistLogin";
import { SmoothScroll } from "@/components/common/SmoothScroll";

function App() {
  return (
    <SmoothScroll>
      <PersistLogin>
        <AppRoutes />
      </PersistLogin>
    </SmoothScroll>
  );
}

export default App;
