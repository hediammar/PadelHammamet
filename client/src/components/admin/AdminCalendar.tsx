import * as React from "react";
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  startOfToday,
  startOfWeek,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Search,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface Event {
  id: string;
  name: string;
  time: string;
  datetime: string;
  courtId: string;
  userId: string;
}

interface CalendarData {
  day: Date;
  events: Event[];
}

interface AdminCalendarProps {
  data: CalendarData[];
  onDayClick?: (day: Date) => void;
  onAddEvent?: () => void;
}

const colStartClasses = [
  "",
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
  "col-start-7",
];

export function AdminCalendar({ data, onDayClick, onAddEvent }: AdminCalendarProps) {
  const today = startOfToday();
  const [selectedDay, setSelectedDay] = React.useState(today);
  const [currentMonth, setCurrentMonth] = React.useState(
    format(today, "MMM-yyyy"),
  );
  const [isDesktop, setIsDesktop] = React.useState(window.innerWidth >= 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date());

  const days = eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth),
    end: endOfWeek(endOfMonth(firstDayCurrentMonth)),
  });

  function previousMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
  }

  function nextMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
  }

  function goToToday() {
    setCurrentMonth(format(today, "MMM-yyyy"));
    setSelectedDay(today);
  }

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
    onDayClick?.(day);
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Calendar Header */}
      <div className="flex flex-col space-y-4 p-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex flex-auto">
          <div className="flex items-center gap-4">
            <div className="hidden w-20 flex-col items-center justify-center rounded-lg border border-white/10 glass p-0.5 md:flex">
              <h1 className="p-1 text-xs uppercase text-white/60">
                {format(today, "MMM")}
              </h1>
              <div className="flex w-full items-center justify-center rounded-lg border border-white/10 glass-strong p-0.5 text-lg font-bold text-white">
                <span>{format(today, "d")}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold text-white">
                {format(firstDayCurrentMonth, "MMMM, yyyy")}
              </h2>
              <p className="text-sm text-white/60">
                {format(firstDayCurrentMonth, "MMM d, yyyy")} -{" "}
                {format(endOfMonth(firstDayCurrentMonth), "MMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          
          <div className="hidden lg:block w-px h-6 bg-white/10"></div>
          <div className="inline-flex w-full -space-x-px rounded-lg shadow-sm md:w-auto">
            <button
              onClick={previousMonth}
              className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg glass hover:bg-white/10 transition-colors p-2 border border-white/10"
              aria-label="Navigate to previous month"
            >
              <ChevronLeft size={16} strokeWidth={2} className="text-white/80" />
            </button>
            <button
              onClick={goToToday}
              className="w-full rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg glass hover:bg-white/10 transition-colors px-4 py-2 border border-white/10 text-white/80 text-sm font-medium md:w-auto"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg glass hover:bg-white/10 transition-colors p-2 border border-white/10"
              aria-label="Navigate to next month"
            >
              <ChevronRight size={16} strokeWidth={2} className="text-white/80" />
            </button>
          </div>
          <div className="hidden md:block w-px h-6 bg-white/10"></div>
          <div className="block w-full md:hidden h-px bg-white/10"></div>
          <button
            onClick={onAddEvent}
            className="w-full gap-2 md:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center"
          >
            <PlusCircle size={16} strokeWidth={2} />
            <span>New Reservation</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="lg:flex lg:flex-auto lg:flex-col">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 border border-white/10 text-center text-xs font-semibold leading-6">
          <div className="border-r border-white/10 py-2.5 text-white/80">Sun</div>
          <div className="border-r border-white/10 py-2.5 text-white/80">Mon</div>
          <div className="border-r border-white/10 py-2.5 text-white/80">Tue</div>
          <div className="border-r border-white/10 py-2.5 text-white/80">Wed</div>
          <div className="border-r border-white/10 py-2.5 text-white/80">Thu</div>
          <div className="border-r border-white/10 py-2.5 text-white/80">Fri</div>
          <div className="py-2.5 text-white/80">Sat</div>
        </div>

        {/* Calendar Days */}
        <div className="flex text-xs leading-6 lg:flex-auto">
          <div className="hidden w-full border-x border-white/10 lg:grid lg:grid-cols-7 lg:grid-rows-5">
            {days.map((day: Date, dayIdx: number) =>
              !isDesktop ? (
                <button
                  onClick={() => handleDayClick(day)}
                  key={dayIdx}
                  type="button"
                  className={cn(
                    isEqual(day, selectedDay) && "text-white",
                    !isEqual(day, selectedDay) &&
                      !isToday(day) &&
                      isSameMonth(day, firstDayCurrentMonth) &&
                      "text-white",
                    !isEqual(day, selectedDay) &&
                      !isToday(day) &&
                      !isSameMonth(day, firstDayCurrentMonth) &&
                      "text-white/40",
                    (isEqual(day, selectedDay) || isToday(day)) &&
                      "font-semibold",
                    "flex h-14 flex-col border-b border-r border-white/10 px-3 py-2 hover:bg-white/5 focus:z-10",
                  )}
                >
                  <time
                    dateTime={format(day, "yyyy-MM-dd")}
                    className={cn(
                      "ml-auto flex size-6 items-center justify-center rounded-full",
                      isEqual(day, selectedDay) &&
                        isToday(day) &&
                        "bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-white",
                      isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        "bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-white",
                    )}
                  >
                    {format(day, "d")}
                  </time>
                  {data.filter((date) => isSameDay(date.day, day)).length >
                    0 && (
                    <div>
                      {data
                        .filter((date) => isSameDay(date.day, day))
                        .map((date) => (
                          <div
                            key={date.day.toString()}
                            className="-mx-0.5 mt-auto flex flex-wrap-reverse"
                          >
                            {date.events.map((event) => (
                              <span
                                key={event.id}
                                className="mx-0.5 mt-1 h-1.5 w-1.5 rounded-full bg-[var(--color-padel-green)]"
                              />
                            ))}
                          </div>
                        ))}
                    </div>
                  )}
                </button>
              ) : (
                <div
                  key={dayIdx}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    dayIdx === 0 && colStartClasses[getDay(day)],
                    !isEqual(day, selectedDay) &&
                      !isToday(day) &&
                      !isSameMonth(day, firstDayCurrentMonth) &&
                      "bg-white/5 text-white/40",
                    "relative flex flex-col border-b border-r border-white/10 hover:bg-white/5 focus:z-10 min-h-[120px]",
                    !isEqual(day, selectedDay) && "hover:bg-white/5",
                  )}
                >
                  <header className="flex items-center justify-between p-2.5">
                    <button
                      type="button"
                      className={cn(
                        isEqual(day, selectedDay) && "text-white",
                        !isEqual(day, selectedDay) &&
                          !isToday(day) &&
                          isSameMonth(day, firstDayCurrentMonth) &&
                          "text-white",
                        !isEqual(day, selectedDay) &&
                          !isToday(day) &&
                          !isSameMonth(day, firstDayCurrentMonth) &&
                          "text-white/40",
                        isEqual(day, selectedDay) &&
                          isToday(day) &&
                          "border-none bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-white",
                        isEqual(day, selectedDay) &&
                          !isToday(day) &&
                          "bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-white",
                        (isEqual(day, selectedDay) || isToday(day)) &&
                          "font-semibold",
                        "flex h-7 w-7 items-center justify-center rounded-full text-xs hover:border border-white/20 text-white",
                      )}
                    >
                      <time dateTime={format(day, "yyyy-MM-dd")}>
                        {format(day, "d")}
                      </time>
                    </button>
                  </header>
                  <div className="flex-1 p-2.5">
                    {data
                      .filter((dateData) => isSameDay(dateData.day, day))
                      .map((dayData) => (
                        <div key={dayData.day.toString()} className="space-y-1.5">
                          {dayData.events.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className="flex flex-col items-start gap-1 rounded-lg border border-[var(--color-padel-green)]/30 bg-[var(--color-padel-green)]/10 p-2 text-xs leading-tight"
                            >
                              <p className="font-medium leading-none text-white">
                                {event.name}
                              </p>
                              <p className="leading-none text-white/60">
                                {event.time} - Court {event.courtId.replace('court-', '')}
                              </p>
                            </div>
                          ))}
                          {dayData.events.length > 2 && (
                            <div className="text-xs text-white/60">
                              + {dayData.events.length - 2} more
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ),
            )}
          </div>
          <div className="isolate grid w-full grid-cols-7 grid-rows-5 border-x border-white/10 lg:hidden">
            {days.map((day: Date, dayIdx: number) => (
              <button
                onClick={() => handleDayClick(day)}
                key={dayIdx}
                type="button"
                className={cn(
                  isEqual(day, selectedDay) && "text-white",
                  !isEqual(day, selectedDay) &&
                    !isToday(day) &&
                    isSameMonth(day, firstDayCurrentMonth) &&
                    "text-white",
                  !isEqual(day, selectedDay) &&
                    !isToday(day) &&
                    !isSameMonth(day, firstDayCurrentMonth) &&
                    "text-white/40",
                  (isEqual(day, selectedDay) || isToday(day)) &&
                    "font-semibold",
                  "flex h-14 flex-col border-b border-r border-white/10 px-3 py-2 hover:bg-white/5 focus:z-10",
                )}
              >
                <time
                  dateTime={format(day, "yyyy-MM-dd")}
                  className={cn(
                    "ml-auto flex size-6 items-center justify-center rounded-full",
                    isEqual(day, selectedDay) &&
                      isToday(day) &&
                      "bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-white",
                    isEqual(day, selectedDay) &&
                      !isToday(day) &&
                      "bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-white",
                  )}
                >
                  {format(day, "d")}
                </time>
                {data.filter((date) => isSameDay(date.day, day)).length > 0 && (
                  <div>
                    {data
                      .filter((date) => isSameDay(date.day, day))
                      .map((date) => (
                        <div
                          key={date.day.toString()}
                          className="-mx-0.5 mt-auto flex flex-wrap-reverse"
                        >
                          {date.events.map((event) => (
                            <span
                              key={event.id}
                              className="mx-0.5 mt-1 h-1.5 w-1.5 rounded-full bg-[var(--color-padel-green)]"
                            />
                          ))}
                        </div>
                      ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

