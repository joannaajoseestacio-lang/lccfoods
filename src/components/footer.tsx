import {Link} from "react-router-dom"
import logo from "@/assets/logo.jpg"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8">
                <img className="h-8 w-8 rounded-2xl" src={logo} alt="logo" />
              </div>
              <span className="text-lg font-bold tracking-tight text-pink-400 font-serif">
                LCC Canteen
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Discover the best local canteen stores and get your meals ready in minutes.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Company
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              {["About Us", "Careers", "Blog", "Press"].map((item) => (
                <li key={item}>
                  <Link
                    to="#"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Support
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              {["Help Center", "Safety", "Terms", "Privacy"].map((item) => (
                <li key={item}>
                  <Link
                    to="#"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 md:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 LCCFoods. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Instagram", "Twitter", "Facebook"].map((social) => (
              <Link
                key={social}
                to="#"
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {social}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
