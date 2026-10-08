import React from "react";

import { Button } from "@/shared/ui/button";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Application Error:", error);
    console.error(errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="
            flex min-h-screen flex-col
            items-center justify-center
            bg-background px-6 text-center
          "
        >
          <div className="max-w-md space-y-6">
            <h1 className="text-4xl font-bold tracking-tight">
              Something went wrong
            </h1>

            <p className="text-muted-foreground">
              An unexpected error occurred while rendering the page.
            </p>

            <Button onClick={this.handleReload}>Reload Application</Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
