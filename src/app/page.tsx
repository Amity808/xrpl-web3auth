// Importing the Web3Authentication component from the components directory
import Web3Authentication from "@/components/Web3Authentication";

// Exporting the Home component as the default export of this module
export default function Home() {
  return (
    // Main section of the Home component
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {/* Including the Web3Authentication component */}
      <Web3Authentication />
    </main>
  );
}
