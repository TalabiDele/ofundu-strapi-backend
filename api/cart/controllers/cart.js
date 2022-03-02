"use strict";
const { sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  // Create event with linked user
  async create(ctx) {
    let entity;
    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      data.user = ctx.state.user.id;
      entity = await strapi.services.cart.create(data, { files });
    } else {
      ctx.request.body.user = ctx.state.user.id;
      entity = await strapi.services.cart.create(ctx.request.body);
    }
    return sanitizeEntity(entity, { model: strapi.models.cart });
  },
  // Update user event
  async update(ctx) {
    const { id } = ctx.params;

    let entity;

    const [cart] = await strapi.services.cart.find({
      id: ctx.params.id,
      "user.id": ctx.state.user.id,
    });

    if (!cart) {
      return ctx.unauthorized(`You can't update this entry`);
    }

    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.cart.update({ id }, data, {
        files,
      });
    } else {
      entity = await strapi.services.cart.update({ id }, ctx.request.body);
    }

    return sanitizeEntity(entity, { model: strapi.models.cart });
  },
  // Delete a user event
  async delete(ctx) {
    const { id } = ctx.params;

    const [cart] = await strapi.services.cart.find({
      id: ctx.params.id,
      "user.id": ctx.state.user.id,
    });

    if (!cart) {
      return ctx.unauthorized(`You can't update this entry`);
    }

    const entity = await strapi.services.cart.delete({ id });
    return sanitizeEntity(entity, { model: strapi.models.cart });
  },
  // Get logged in users
  async me(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: "No authorization header was found" }] },
      ]);
    }

    const data = await strapi.services.cart.find({ user: user.id });

    if (!data) {
      return ctx.notFound();
    }

    return sanitizeEntity(data, { model: strapi.models.cart });
  },
};
