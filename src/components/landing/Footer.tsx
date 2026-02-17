export default function Footer() {
  return (
    <footer className="py-12 bg-background">
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <p className="text-muted-foreground">
            &copy; {new Date().getFullYear()} NaphtalAI. All rights reserved.
          </p>
          <div className="flex mt-4 space-x-6 md:mt-0">
            <a href="#" className="text-muted-foreground hover:text-foreground">
              Privacy Policy
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
