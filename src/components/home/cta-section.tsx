import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function CTASection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Ready to Get Started?</h2>
            <p className="max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Join thousands of satisfied customers who use NotaryAvailability for their notary needs
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <Link href="/notaries">
              <Button size="lg" variant="secondary" className="px-8">Find a Notary</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline" className="bg-transparent border-white hover:bg-white/10 px-8">Become a Notary</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}