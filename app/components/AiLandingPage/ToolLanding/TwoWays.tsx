import { FC } from "react";
import SectionPill from "./SectionPill";

const NUMBER_COLORS = ["#8BC34A", "#26A69A", "#00BCD4", "#2196F3"];

type Step = { title: string; description: string };

export interface TwoWaysColumn {
  heading: string;
  /** Optional short line under the column heading. */
  sub?: string;
  steps: Step[];
}

export interface TwoWaysContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  freeColumn: TwoWaysColumn;
  expertColumn: TwoWaysColumn;
}

const StepList: FC<{ steps: Step[] }> = ({ steps }) => (
  <div className="relative flex-1 rounded-2xl bg-white p-6 md:p-8">
    {/* dashed spine connecting the numbered circles */}
    <span
      aria-hidden
      className="absolute bottom-16 top-16 left-[52px] border-l-2 border-dashed border-gray-300 md:left-[64px]"
    />
    <div className="relative space-y-9">
      {steps.map((step, i) => (
        <div key={step.title} className="flex items-start gap-5">
          <span
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-white text-2xl font-bold"
            style={{ color: NUMBER_COLORS[i % NUMBER_COLORS.length] }}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <div>
            <h4 className="text-xl font-semibold text-[#17172B] md:text-2xl">
              {step.title}
            </h4>
            <p className="mt-2 text-base leading-7 text-gray-600">
              {step.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Column: FC<{ column: TwoWaysColumn; bgClassName: string }> = ({
  column,
  bgClassName,
}) => (
  <div className={`flex flex-col rounded-3xl p-5 md:p-6 ${bgClassName}`}>
    <div className="px-2 py-4">
      <h3 className="text-2xl font-semibold text-white md:text-3xl">
        {column.heading}
      </h3>
      {column.sub && <p className="mt-1 text-base text-white/90">{column.sub}</p>}
    </div>
    <StepList steps={column.steps} />
  </div>
);

/** "Two ways ..." — free tool vs expert services columns. */
const TwoWays: FC<{ content: TwoWaysContent }> = ({ content: c }) => (
  <section className="bg-white py-16 md:py-20">
    <div className="mx-auto max-w-[1300px] px-4">
      <SectionPill>{c.eyebrow}</SectionPill>
      <h2 className="mt-6 text-center text-3xl font-bold text-[#17172B] md:text-5xl">
        {c.title}
      </h2>
      <p className="mt-5 text-center text-base text-gray-700 md:text-lg">
        {c.subtitle}
      </p>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <Column column={c.freeColumn} bgClassName="bg-[#9F92EC]" />
        <Column column={c.expertColumn} bgClassName="bg-primary-400" />
      </div>
    </div>
  </section>
);

export default TwoWays;
