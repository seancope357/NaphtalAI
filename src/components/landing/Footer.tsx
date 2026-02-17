export default function Footer() {
  return (
    <footer className="py-12 bg-background">
      <div className="px-6 mx-auto max-w-7xl lg:px-8">
        <div className="flex justify-between">
          <p className="text-base text-muted-foreground">
            &copy; 2024 NaphtalAI. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-base text-muted-foreground">
              About Us
            </a>
            <a href="#" className="text-base text-muted-foreground">
              Privacy Policy
            </a>
            <a href="#" className="text-base text-muted-foreground">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
