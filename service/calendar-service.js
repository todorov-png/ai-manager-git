import googleCalendar from '@googleapis/calendar';

class CalendarService {
  constructor() {
    this.SCOPE_CALENDAR = 'https://www.googleapis.com/auth/calendar';
    this.SCOPE_EVENTS = 'https://www.googleapis.com/auth/calendar.events';
    this.auth = null;
    this.authenticate()
      .then(res => (this.auth = res))
      .catch(e => console.log(e));
    this.calendar = googleCalendar.calendar('v3');
  }

  async authenticate() {
    try {
      const jwtClient = new googleCalendar.auth.JWT(
        process.env.GOOGLE_CLIENT_EMAIL,
        null,
        process.env.GOOGLE_PRIVATE_KEY,
        [this.SCOPE_CALENDAR, this.SCOPE_EVENTS]
      );
      await jwtClient.authorize();
      return jwtClient;
    } catch (e) {
      console.log(e);
    }
  }

  async create(event, calendarId) {
    try {
      const answer = await this.calendar.events.insert({
        auth: this.auth,
        calendarId,
        resource: event,
      });
      return answer.data.id;
    } catch {
      return '';
    }
  }

  async update(event, calendarId, id) {
    try {
      const answer = await this.calendar.events.update({
        auth: this.auth,
        calendarId,
        eventId: id,
        resource: event,
      });
      return answer.data.id;
    } catch {
      return '';
    }
  }

  async createOrUpdate(event, calendarId, id = '') {
    if (!calendarId) return '';
    if (id) {
      return await this.update(event, calendarId, id);
    } else {
      return await this.create(event, calendarId);
    }
  }
}

export default new CalendarService();
