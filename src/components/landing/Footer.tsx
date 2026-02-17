export default function Footer() {
  return (
    <footer className="py-12 bg-background">
      <div className="px-6 mx-auto max-w-7xl lg:px-8">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <p className="text-base text-muted-foreground">
            &copy; 2024 NaphtalAI. All rights reserved.
          </p>
          <div className="flex mt-4 space-x-6 md:mt-0">
            <a href="#" className="text-base text-muted-foreground hover:text-foreground">
              About Us
            </a>
            <a href="#" className="text-base text-muted-foreground hover:text-foreground">
              Privacy Policy
            </a>
            <a href="#" className="text-base text-muted-foreground hover:text-foreground">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
