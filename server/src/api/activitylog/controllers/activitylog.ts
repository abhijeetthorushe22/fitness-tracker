/**
 * activitylog controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::activitylog.activitylog', ({ strapi }) => ({

    async create(ctx) {
        const user = ctx.state.user;

        if (!user)
            return ctx.unauthorized("Login required");

        const body = ctx.request.body.data;
        body.users_permissions_user = user.id;  // fixed: was user_permissions_user (missing 's')

        const entry = await strapi.entityService.create('api::activitylog.activitylog', {
            data: body,
            populate: ["users_permissions_user"]
        });

        return entry;
    },  // fixed: was missing closing brace + comma, causing find() to be nested inside create()

    async find(ctx) {
        const user = ctx.state.user;

        if (!user)
            return ctx.unauthorized("Login required");

        const result = await strapi.entityService.findMany('api::activitylog.activitylog', {
            filters: { users_permissions_user: user.id },
            populate: ["users_permissions_user"]
        });

        return result;
    },

    async findOne(ctx) {  // fixed: was "async this.findOne" — invalid syntax
        const user = ctx.state.user;
        const { id } = ctx.params;

        if (!user)
            return ctx.unauthorized("Login required");

        // fixed: use findOne (not findMany), correct entityService signature
        const result = await strapi.entityService.findOne('api::activitylog.activitylog', id, {
            populate: ["users_permissions_user"]
        });

        // fixed: findOne returns object or null, not an array
        if (!result) return ctx.notFound("Not found");

        // @ts-ignore — ensure the entry belongs to the requesting user
        if (result.users_permissions_user?.id !== user.id)
            return ctx.forbidden("Not yours");

        return result;
    }

}));
