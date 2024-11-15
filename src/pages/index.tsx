import {subtitle, title} from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import {CommandMenu} from "@/components/command-menu";

export default function IndexPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 h-screen">
        <div className="inline-block max-w-lg text-center">
          <h1 className={title()}>BrowserBrain&nbsp;</h1>
          <h4 className={subtitle({ class: "mt-4" })}>
            Find anything you’ve ever learned, touched, or thought about within seconds.
          </h4>
            <CommandMenu/>
        </div>
      </section>
    </DefaultLayout>
  );
}
