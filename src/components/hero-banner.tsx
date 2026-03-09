import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://laconcepcioncollege.com/wp-content/uploads/2011/04/3.jpg"
          alt="Delicious food spread"
          className="object-cover w-full h-screen"
        />
        <div className="absolute inset-0 bg-blue-400/90" />
      </div>
      <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-center px-4 py-20 md:py-28 lg:px-6 lg:py-32">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary-foreground/80">
          LCC Foods
        </p>
        <h1 className="max-w-xl text-balance font-serif text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
          Skip long queues, enjoy your food
        </h1>
        <p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-primary-foreground/80 md:text-lg">
          Discover the best local canteen stores and get your meals ready in
          minutes. Skip long lines and enjoy your foods.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link to="#products">
            <Button size="lg" className="rounded-full gap-2 px-6 font-semibold">
              View Menu
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
