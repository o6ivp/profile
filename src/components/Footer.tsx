const Footer = () => {
  return (
    <footer className="border-t border-border/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Daigo Yamashita
        </p>
      </div>
    </footer>
  );
};

export default Footer;
