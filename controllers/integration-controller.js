import tokenService from '../service/token-service.js';
import clientService from '../service/client-service.js';
import notionService from '../service/notion-service.js';
import managerService from '../service/manager-service.js';
import integrationService from '../service/integration-service.js';
import ApiError from '../exceptions/api-error.js';
import { Client, LogLevel } from '@notionhq/client';

class IntegrationController {
  async create(req, res, next) {
    try {
      let notion = null;
      const { refreshToken } = req.cookies;
      const { notionToken, taskTypeTable, rulesTable, taskTable, calendar } =
        req.body;
      const tokenData = await tokenService.get(refreshToken);
      const UserData = await clientService.findByIdFull(tokenData.user);
      if (!notionToken) {
        throw ApiError.BadRequerest(
          req.t('CONTROLLER.INTEGRATION.NOTION_TOKEN.EMPTY')
        );
      }
      try {
        notion = new Client({
          auth: notionToken,
          logLevel: LogLevel.DEBUG,
        });
        await notion.users.list();
      } catch (e) {
        if (e.status === 401) {
          throw ApiError.BadRequerest(
            req.t('CONTROLLER.INTEGRATION.NOTION_TOKEN.INVALID')
          );
        }
      }
      if (!taskTypeTable) {
        throw ApiError.BadRequerest(
          req.t('CONTROLLER.INTEGRATION.TASK_TYPE_TABLE.EMPTY')
        );
      }
      const taskTypeTime = await notionService.getTaskTypeTime(
        notion,
        taskTypeTable
      );
      if (!Object.keys(taskTypeTime).length) {
        throw ApiError.BadRequerest(
          req.t('CONTROLLER.INTEGRATION.TASK_TYPE_TABLE.NOT_FOUND')
        );
      }
      if (!rulesTable) {
        throw ApiError.BadRequerest(
          req.t('CONTROLLER.INTEGRATION.RULES_TABLE.EMPTY')
        );
      }
      const maxProdTime = await notionService.getMaxProdTime(
        notion,
        rulesTable
      );
      if (!maxProdTime) {
        throw ApiError.BadRequerest(
          req.t('CONTROLLER.INTEGRATION.RULES_TABLE.NOT_FOUND')
        );
      }
      if (!taskTable) {
        throw ApiError.BadRequerest(
          req.t('CONTROLLER.INTEGRATION.TASK_TABLE.EMPTY')
        );
      }
      const tasks = await notionService.getTasks(notion, taskTable);
      if (!tasks.length) {
        throw ApiError.BadRequerest(
          req.t('CONTROLLER.INTEGRATION.TASK_TABLE.NOT_FOUND')
        );
      }
      const integration = await integrationService.create({
        notionToken,
        taskTypeTable,
        rulesTable,
        taskTable,
        calendar: calendar ? calendar : null,
      });
      await clientService.update(UserData._id, {
        integration: integration._id,
      });
      await managerService.runManager(
        notionToken,
        taskTypeTable,
        rulesTable,
        taskTable,
        calendar
      );
      return res.end();
    } catch (e) {
      next(e);
    }
  }

  async update(req, res, next) {
    try {
      let notion = null;
      const { refreshToken } = req.cookies;
      const { notionToken, taskTypeTable, rulesTable, taskTable, calendar } =
        req.body;
      const tokenData = await tokenService.get(refreshToken);
      const UserData = await clientService.findByIdFull(tokenData.user);
      if (!notionToken) {
        throw ApiError.BadRequerest(
          req.t('CONTROLLER.INTEGRATION.NOTION_TOKEN.EMPTY')
        );
      }
      try {
        notion = new Client({
          auth: notionToken,
          logLevel: LogLevel.DEBUG,
        });
        await notion.users.list();
      } catch (e) {
        if (e.status === 401) {
          throw ApiError.BadRequerest(
            req.t('CONTROLLER.INTEGRATION.NOTION_TOKEN.INVALID')
          );
        }
      }
      if (!taskTypeTable) {
        throw ApiError.BadRequerest(
          req.t('CONTROLLER.INTEGRATION.TASK_TYPE_TABLE.EMPTY')
        );
      }
      const taskTypeTime = await notionService.getTaskTypeTime(
        notion,
        taskTypeTable
      );
      if (!Object.keys(taskTypeTime).length) {
        throw ApiError.BadRequerest(
          req.t('CONTROLLER.INTEGRATION.TASK_TYPE_TABLE.NOT_FOUND')
        );
      }
      if (!rulesTable) {
        throw ApiError.BadRequerest(
          req.t('CONTROLLER.INTEGRATION.RULES_TABLE.EMPTY')
        );
      }
      const maxProdTime = await notionService.getMaxProdTime(
        notion,
        rulesTable
      );
      if (!maxProdTime) {
        throw ApiError.BadRequerest(
          req.t('CONTROLLER.INTEGRATION.RULES_TABLE.NOT_FOUND')
        );
      }
      if (!taskTable) {
        throw ApiError.BadRequerest(
          req.t('CONTROLLER.INTEGRATION.TASK_TABLE.EMPTY')
        );
      }
      const tasks = await notionService.getTasks(notion, taskTable);
      if (!tasks.length) {
        throw ApiError.BadRequerest(
          req.t('CONTROLLER.INTEGRATION.TASK_TABLE.NOT_FOUND')
        );
      }
      await integrationService.update(UserData.integration, {
        notionToken,
        taskTypeTable,
        rulesTable,
        taskTable,
        calendar: calendar ? calendar : null,
      });
      await managerService.runManager(
        notionToken,
        taskTypeTable,
        rulesTable,
        taskTable,
        calendar
      );
      return res.end();
    } catch (e) {
      next(e);
    }
  }

  async get(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const tokenData = await tokenService.get(refreshToken);
      const UserData = await clientService.findByIdFull(tokenData.user);
      return UserData.integration ? res.json(UserData.integration) : res.end();
    } catch (e) {
      next(e);
    }
  }
}

export default new IntegrationController();
