import type IntlService from 'ember-intl/services/intl';
import type { UnknownRecord } from 'type-fest';

import Helper from '@ember/component/helper';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Now from '@ember-schema-app/ember-schema/helpers/now';
import { use } from 'ember-resources';

const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR = 3600;
const SECONDS_IN_DAY = 86400;
const SECONDS_IN_MONTH = 2592000;
const SECONDS_IN_YEAR = 31536000;

type RelativeTimeStyle = 'long' | 'narrow' | 'short';

interface FormatRelativeSmartTimeSignature {
  Args: {
    Named: {
      interval?: number;
      style?: RelativeTimeStyle;
    };
    Positional: [Date];
  };
  Return: string;
}

export default class SmartTimeHelper extends Helper<FormatRelativeSmartTimeSignature> {
  @tracked interval = 5;

  @service declare intl: IntlService;

  get now() {
    return this._now.current;
  }

  override compute(
    [date]: FormatRelativeSmartTimeSignature['Args']['Positional'],
    { interval = 5, style = 'long' }: FormatRelativeSmartTimeSignature['Args']['Named'],
  ): string {
    this.interval = interval;

    const wrappedFormatRelativeTime = (number: number, options: UnknownRecord) =>
      this.intl.formatRelativeTime.call(this.intl, number, { ...options, style });

    /**
     * TODO: COULD WE OPTIMISE THIS BY DECREASING THE INTERVAL RELATIVE TO THE NUMBER OF SECONDS WHICH WE ARE
     * CALCULATINS?
     *
     * I.E, IF WE'RE SHOWING `4 HOURS AGO`, WE DON'T NEED TO TRIGGER THE INTERVAL EVERY 5 SECONDS, EVERY MINUTE WOULD BE
     * FINE, LIKE WISE EVERY HOUR FOR `4 DAYS AGO` ETC
     *
     * @see https://stackoverflow.com/a/1280279
     */
    return formatRelativeSmart({
      date,
      formatRelativeTime: wrappedFormatRelativeTime,
      /**
       * @NOTE: Although `this.now` is a Date, for some reason the `@use` decorator gives it the type of `Cell<Date>`, so we need to cast it to `Date`
       */
      now: this.now,
    });
  }

  _now = use(this, Now(5));
}

export function formatRelativeSmart({
  date,
  formatRelativeTime,
  now,
}: {
  date: Date;
  formatRelativeTime: IntlService['formatRelativeTime'];
  now: Date;
}): string {
  const seconds = getDateDeltaSeconds(date, now);

  // Use absolute seconds so we don't need to deal with past / future date delta
  const absSeconds = Math.abs(seconds);

  if (absSeconds < 5) {
    return 'Just now';
  } else if (absSeconds < SECONDS_IN_MINUTE) {
    return formatRelativeTime(seconds, { unit: 'seconds' });
  } else if (absSeconds < SECONDS_IN_HOUR) {
    return formatRelativeTime(Math.round(seconds / SECONDS_IN_MINUTE), {
      unit: 'minutes',
    });
  } else if (absSeconds < SECONDS_IN_DAY) {
    return formatRelativeTime(Math.round(seconds / SECONDS_IN_HOUR), {
      unit: 'hours',
    });
  } else if (absSeconds < SECONDS_IN_MONTH) {
    return formatRelativeTime(Math.round(seconds / SECONDS_IN_DAY), {
      unit: 'days',
    });
  } else if (absSeconds < SECONDS_IN_YEAR) {
    return formatRelativeTime(Math.round(seconds / SECONDS_IN_MONTH), {
      unit: 'months',
    });
  } else {
    return formatRelativeTime(Math.round(seconds / SECONDS_IN_YEAR), {
      unit: 'years',
    });
  }
}

function getDateDeltaSeconds(date1: Date, date2: Date): number {
  return Math.floor((date1.getTime() - date2.getTime()) / 1000);
}
