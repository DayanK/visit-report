type UserCalendar = {
  id?: number;
  start: {
    dateTime: string;
    timeZone: string;
  };
  location: {
    displayName: string;
    address: {
      street: string;
      city: string;
      state: string;
      countryOrRegion: string;
      postalCode: string;
    };
    organizer: {
      emailAddress: {
        name: string;
        address: string;
      };
    };
  };
};

export interface IWeekData {
  id?: number;
  weekNumber: string;
  totalVisited: number;
  visitReportCreated: number;
  withoutVisitReport: number;
  weekend: IDayData[];
}

export interface IDayData {
  id?: number;
  dayOfVisit: string;
  totalDayVisited: number;
  visitDayReportCreated: number;
  withoutVisitReport: number;
  days: IFormattedItem[];
  isCompleted: boolean;
}

export interface IFormattedItem {
  id?: number;
  appointmentId: string;
  dayOfVisit: string;
  userId: string;
  name: string;
  dateStart: string;
  dateEnd: string;
  busines: string;
  street: string;
  city: string;
  countryOrRegion: string;
  postCode: string;
  isCompleted: boolean;
}

export interface ISorter {
  [key: string]: number;
}

export type IVisit = {
  userId: string;
  appointmentId: string | undefined;
  subject: string | undefined;
  partner: string | undefined;
  outcome: string | number | undefined;
  visitType: string | number | undefined;
  appointmentDate: string;
  note: string | undefined;
  visitTime: string;
  id?: string;
};
