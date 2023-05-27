class NotionService {
  async getMaxProdTime(notion, tableId) {
    let maxProdTime = 0;
    try {
      const list = await notion.databases.query({ database_id: tableId });
      const data = list.results.find(
        row =>
          row.properties.Name.title.length &&
          row.properties.Name.title[0].text.content ===
            'Max productivity date time'
      );
      maxProdTime = data.properties.Value.number;
    } catch (e) {
      console.log('getMaxProdTime', e);
    } finally {
      return maxProdTime;
    }
  }

  async getTaskTypeTime(notion, tableId) {
    let taskTypeTime = {};
    try {
      const list = await notion.databases.query({ database_id: tableId });
      for (const task of list.results) {
        taskTypeTime[task.id] = task.properties['Max min per day'].number;
      }
    } catch (e) {
      console.log('taskTypeTime', e);
    } finally {
      return taskTypeTime;
    }
  }

  async getTasks(notion, tableId) {
    try {
      const list = await notion.databases.query({
        database_id: tableId,
        filter: {
          and: [
            {
              property: 'NeedUpdateOfAutoDate',
              formula: {
                string: {
                  contains: 'yes',
                },
              },
            },
            {
              property: 'Status',
              status: {
                does_not_equal: 'Done',
              },
            },
          ],
        },
        sorts: [
          {
            property: 'BetterDateForStart',
            direction: 'ascending',
          },
          {
            property: 'LeftDays',
            direction: 'ascending',
          },
          {
            property: 'Action',
            direction: 'ascending',
          },
          {
            property: 'Type',
            direction: 'ascending',
          },
          {
            property: 'Term',
            direction: 'ascending',
          },
        ],
      });
      return list.results;
    } catch (e) {
      console.log('getTasks', e);
      return [];
    }
  }

  async updateTask(notion, pageId, properties) {
    try {
      const response = await notion.pages.update({
        page_id: pageId,
        properties: properties,
      });
      return response;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}

export default new NotionService();
