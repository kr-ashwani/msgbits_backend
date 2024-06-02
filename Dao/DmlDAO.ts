import { CreateOptions, HydratedDocument, ProjectionType, QueryOptions } from "mongoose";
import { RowMapper } from "./RowMapper/RowMapper";

/**
 * Base DAO class for all mongo CRUD operations
 * All DAO class must implement this base DAO class
 */
abstract class DmlDAO<T, V> {
  /**
   *
   * @param docs document or document array to be inserted
   * @param rowMapper rowMapper accepts a callback function which executes for every document returned from DB
   * @param options mongoose create options
   */
  abstract create(
    docs: T | T[],
    rowMapper: RowMapper<HydratedDocument<V>>,
    options?: CreateOptions
  ): Promise<void>;

  /**
   *
   * @param filter
   * @param rowMapper
   * @param projection
   * @param options
   */
  abstract find(
    filter: Partial<T>,
    rowMapper: RowMapper<HydratedDocument<T>>,
    projection?: ProjectionType<T> | null | undefined,
    options?: QueryOptions<T> | null | undefined
  ): Promise<void>;

  /**
   *
   * @param filter
   * @param update
   * @param rowMapper
   * @param options
   */
  abstract update(
    filter: Partial<T>,
    update: Partial<T>,
    rowMapper: RowMapper<HydratedDocument<T>>,
    options?: QueryOptions<T> | null | undefined
  ): Promise<void>;
}

export { DmlDAO };
