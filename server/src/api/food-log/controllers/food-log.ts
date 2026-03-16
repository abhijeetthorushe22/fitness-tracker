/**
 * food-log controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::food-log.food-log', ({ strapi }) => ({

    async create(ctx) {
        const user = ctx.state.user;

        if (!user)
            return ctx.unauthorized("Login required");

        const body = ctx.request.body.data;
        body.users_permissions_user = user.id;

        const entry = await strapi.entityService.create('api::food-log.food-log', {
            data: body,
            populate: ["users_permissions_user"]
        });

        return entry;
    },

    async find(ctx) {
        const user = ctx.state.user;

        if (!user)
            return ctx.unauthorized("Login required");

        const result = await strapi.entityService.findMany('api::food-log.food-log', {
            filters: { users_permissions_user: user.id },
            populate: ["users_permissions_user"]
        });

        return result;
    },

    async findOne(ctx) {
        const user = ctx.state.user;
        const { id } = ctx.params;

        if (!user)
            return ctx.unauthorized("Login required");

        const result = await strapi.entityService.findOne('api::food-log.food-log', id, {
            populate: ["users_permissions_user"]
        });

        if (!result) return ctx.notFound("Not found");


        if ((result as any).users_permissions_user?.id !== user.id)
            return ctx.forbidden("Not yours");

        return result;
    }

}));
