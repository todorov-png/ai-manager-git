import integrationService from './integration-service.js';
import notionService from './notion-service.js';
import calendarService from './calendar-service.js';
import { Client, LogLevel } from '@notionhq/client';

class ManagerService {
  async runManager(
    notionToken,
    taskTypeTable,
    rulesTable,
    taskTable,
    calendarId = ''
  ) {
    // Если данные не переданы, то не работаем
    if (!notionToken || !taskTypeTable || !rulesTable || !taskTable) {
      return null;
    }
    const days = {};
    let notion = null;
    try {
      notion = new Client({
        auth: notionToken,
        logLevel: LogLevel.DEBUG,
      });
      await notion.users.list();
    } catch (e) {
      // Неверный токен
      if (e.status === 401) return null;
    }

    // Получаем типы задач и проверяем есть ли такая таблица
    const taskTypeTime = await notionService.getTaskTypeTime(
      notion,
      taskTypeTable
    );
    if (!Object.keys(taskTypeTime).length) return null;

    // Получаем максимальную продуктивность за день и проверяем есть ли она
    const maxProdTime = await notionService.getMaxProdTime(notion, rulesTable);
    if (!maxProdTime) return null;

    // Получаем задачи и проверяем есть ли они
    const taskList = await notionService.getTasks(notion, taskTable);
    if (!taskList.length) return null;

    for (const task of taskList) {
      const dateTime = task.properties['Date&Time'].date;
      const type = task.properties.Type.relation[0]?.id;
      const taskTime = task.properties['INeedMinPerDay'].number || 0;
      let taskCalendarEventId =
        task.properties['CalendarEventId'].rich_text[0]?.plain_text || '';
      if (
        !taskTime ||
        taskTypeTime[type] < taskTime ||
        maxProdTime < taskTime
      ) {
        // Время выполнения задачи превышает время в этой категории или максимальную продуктивность в день
        await notionService.updateTask(notion, task.id, {
          Error: {
            rich_text: [
              {
                type: 'text',
                text: {
                  // content: 'Task time exceeds specified runtime limits',
                  content: 'yes',
                  link: null,
                },
                annotations: {
                  bold: false,
                  italic: false,
                  strikethrough: false,
                  underline: false,
                  code: false,
                  color: 'default',
                },
                // plain_text: 'Task time exceeds specified runtime limits',
                plain_text: 'yes',
              },
            ],
          },
        });
      } else if (dateTime) {
        // В задаче указан день выполнения
        const dateStart = dateTime.start; //формат '2023-05-14'
        if (!days[dateStart]) {
          // Данного дня нет в обьекте, значит добавляем его
          days[dateStart] = {
            taskTypeTime: Object.assign({}, taskTypeTime),
            maxProdTime,
          };
        }
        if (
          days[dateStart].maxProdTime - taskTime < 0 ||
          days[dateStart].taskTypeTime[type] - taskTime < 0
        ) {
          // Времени не хватило на эту задачу
          await notionService.updateTask(notion, task.id, {
            Error: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    // content: 'Not enough time for the task',
                    content: 'yes',
                    link: null,
                  },
                  annotations: {
                    bold: false,
                    italic: false,
                    strikethrough: false,
                    underline: false,
                    code: false,
                    color: 'default',
                  },
                  // plain_text: 'Not enough time for the task',
                  plain_text: 'yes',
                },
              ],
            },
          });
        } else {
          // Времени хватает
          days[dateStart].maxProdTime -= taskTime;
          days[dateStart].taskTypeTime[type] -= taskTime;
          taskCalendarEventId = await calendarService.createOrUpdate(
            {
              summary: task.properties.Name.title[0].plain_text,
              start: { date: dateStart },
              end: { date: dateStart },
            },
            calendarId,
            taskCalendarEventId
          );
          await notionService.updateTask(notion, task.id, {
            AutoDate: {
              date: {
                start: dateStart,
              },
            },
            CalendarEventId: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: taskCalendarEventId,
                    link: null,
                  },
                  annotations: {
                    bold: false,
                    italic: false,
                    strikethrough: false,
                    underline: false,
                    code: false,
                    color: 'default',
                  },
                  plain_text: taskCalendarEventId,
                },
              ],
            },
            Error: {
              rich_text: [],
            },
          });
        }
      } else {
        let taskDay = new Date();
        taskDay.setDate(taskDay.getDate() + 1);
        let taskDayISO = taskDay.toISOString().split('T', 1)[0]; //формат '2023-05-14'
        if (!days[taskDayISO]) {
          // Данного дня нет в обьекте, значит добавляем его
          days[taskDayISO] = {
            taskTypeTime: Object.assign({}, taskTypeTime),
            maxProdTime,
          };
        }
        while (
          days[taskDayISO].maxProdTime - taskTime < 0 ||
          days[taskDayISO].taskTypeTime[type] - taskTime < 0
        ) {
          // Если времени не хватило то смотрим следующий день до тех пор пока времени не хватит
          taskDay.setDate(taskDay.getDate() + 1);
          taskDayISO = taskDay.toISOString().split('T', 1)[0];
          if (!days[taskDayISO]) {
            // Данного дня нет в обьекте, значит добавляем его
            days[taskDayISO] = {
              taskTypeTime: Object.assign({}, taskTypeTime),
              maxProdTime,
            };
          }
        }
        // Нашли свободный день и записываем в него дату
        days[taskDayISO].maxProdTime -= taskTime;
        days[taskDayISO].taskTypeTime[type] -= taskTime;
        taskCalendarEventId = await calendarService.createOrUpdate(
          {
            summary: task.properties.Name.title[0].plain_text,
            start: { date: taskDayISO },
            end: { date: taskDayISO },
          },
          calendarId,
          taskCalendarEventId
        );
        await notionService.updateTask(notion, task.id, {
          AutoDate: {
            date: {
              start: taskDayISO,
            },
          },
          CalendarEventId: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: taskCalendarEventId,
                  link: null,
                },
                annotations: {
                  bold: false,
                  italic: false,
                  strikethrough: false,
                  underline: false,
                  code: false,
                  color: 'default',
                },
                plain_text: taskCalendarEventId,
              },
            ],
          },
          Error: {
            rich_text: [],
          },
        });
      }
    }
  }

  async runAllManager() {
    try {
      const listIntegrations = await integrationService.getAll();
      for (let userIntegration of listIntegrations) {
        try {
          const {
            notionToken,
            taskTypeTable,
            rulesTable,
            taskTable,
            calendar,
          } = userIntegration;

          this.runManager(
            notionToken,
            taskTypeTable,
            rulesTable,
            taskTable,
            calendar
          );
        } catch (e) {
          console.log(e);
        }
      }
    } catch (e) {
      console.log(e);
    }
  }
}

export default new ManagerService();
