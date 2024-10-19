import { HydratedDocument, Types } from "mongoose";
import { roleDAO } from "../../../Dao/RoleDAO";
import { RoleRowMapper } from "../../../Dao/RowMapper/RoleRowMapper";
import { IRole } from "../../../model/role.model";
import InsufficientRoleError from "../../../errors/httperror/InsufficientRoleError";
import { resSchemaForModel } from "../../../schema/responseSchema";

class RoleService {
  async findAdminById(input: { userId: Types.ObjectId }) {
    try {
      const role: HydratedDocument<IRole>[] = [];
      await roleDAO.find(
        {
          userId: input.userId,
        },
        new RoleRowMapper((data) => {
          role.push(data);
        })
      );

      if (role.length !== 1)
        throw new InsufficientRoleError(
          "The user lacks the necessary role to access this resource."
        );

      return resSchemaForModel.getRole(role[0]);
    } catch (err) {
      throw err;
    }
  }
}

const roleService = new RoleService();
export { roleService };
