import Sidebar from "./Sidebar";
import Header from "./Header";

function Layout({ children }) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f3f4f6",
      }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Right Side */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          marginLeft: "220px", // Adjust this value based on your sidebar width
        }}
      >
        {/* Header */}
        <Header />

        {/* Main Content */}
        <div
          style={{
            padding: "25px",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;