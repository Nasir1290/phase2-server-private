// // Query Builder in Prisma
// import { PrismaClient } from '@prisma/client';

// class QueryBuilder {
//   private model: any;
//   private query: Record<string, unknown>;
//   private prismaQuery: any = {}; // Define as any for flexibility

//   constructor(model: any, query: Record<string, unknown>) {
//     this.model = model; // Prisma model instance
//     this.query = query; // Query params
//     console.log(query);
//   }
//   // *Search*
//   search(searchableFields: string[]) {
//     const searchTerm = this.query.searchTerm as string;
//     if (searchTerm) {
//       this.prismaQuery.where = {
//         ...this.prismaQuery.where,
//         OR: searchableFields.map((field) => ({
//           [field]: { contains: searchTerm, mode: 'insensitive' },
//         })),
//       };
//     }
//     return this;
//   }

//   // *Filter*
//   filter() {
//     const queryObj = { ...this.query };
//     const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
//     excludeFields.forEach((field) => delete queryObj[field]);

//     const formattedFilters: Record<string, any> = {};
//     for (const [key, value] of Object.entries(queryObj)) {
//       if (typeof value === 'string' && value.includes('[')) {
//         const [field, operator] = key.split('[');
//         const op = operator.slice(0, -1); // Remove the closing ']'
//         formattedFilters[field] = { [`${op}`]: parseFloat(value as string) };
//       } else {
//         formattedFilters[key] = value;
//       }
//     }

//     this.prismaQuery.where = {
//       ...this.prismaQuery.where,
//       ...formattedFilters,
//     };

//     return this;
//   }

//   //raw filter
//   rawFilter(filters: Record<string, any>) {
//     // Ensure that the filters are merged correctly with the existing where conditions
//     this.prismaQuery.where = {
//       ...this.prismaQuery.where,
//       ...filters,
//     };
//     console.log(this.prismaQuery.where)
//     return this;
//   }

//   // *Sorting*
//   sort() {
//     const sort = (this.query.sort as string)?.split(',') || ['-createdAt'];
//     const orderBy = sort.map((field) => {
//       if (field.startsWith('-')) {
//         return { [field.slice(1)]: 'desc' };
//       }
//       return { [field]: 'asc' };
//     });

//     this.prismaQuery.orderBy = orderBy;
//     return this;
//   }

//   // *Pagination*
//   paginate() {
//     const page = Number(this.query.page) || 1;
//     const limit = Number(this.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     this.prismaQuery.skip = skip;
//     this.prismaQuery.take = limit;

//     return this;
//   }

//     // **Custom Select Fields**
//     select(selectFields: Record<string, boolean>) {
//       this.prismaQuery.select = {
//         ...this.prismaQuery.select,
//         ...selectFields,
//       };
//       return this;
//     }

//   // *Fields Selection*
//   fields() {
//     const fields = (this.query.fields as string)?.split(',') || [];
//     if (fields.length > 0) {
//       this.prismaQuery.select = fields.reduce(
//         (acc: Record<string, boolean>, field) => {
//           acc[field] = true;
//           return acc;
//         },
//         {}
//       );
//     }
//     return this;
//   }

//   // **Include Related Models*/
//   include(includableFields: Record<string, boolean | object>) {
//     this.prismaQuery.include = {
//       ...this.prismaQuery.include,
//       ...includableFields,
//     };
//     return this;
//   }

//   // **Execute Query*/
//   async execute() {
//     return this.model.findMany(this.prismaQuery);
//   }

//   // *Count Total*
//   async countTotal() {
//     const total = await this.model.count({ where: this.prismaQuery.where });
//     const page = Number(this.query.page) || 1;
//     const limit = Number(this.query.limit) || 10;
//     const totalPage = Math.ceil(total / limit);

//     return {
//       page,
//       limit,
//       total,
//       totalPage,
//     };
//   }
// }

// export default QueryBuilder;

import { PrismaClient } from "@prisma/client";

class QueryBuilder {
  private model: any;
  private query: Record<string, unknown>;
  private prismaQuery: any = {};
  private postProcessors: ((data: any[]) => any[])[] = [];

  constructor(model: any, query: Record<string, unknown>) {
    this.model = model;
    this.query = query;
  }

  // *Search*
  search(searchableFields: string[]) {
    const searchTerm = this.query.searchTerm as string;
    if (searchTerm) {
      this.prismaQuery.where = {
        ...this.prismaQuery.where,
        OR: searchableFields.map((field) => ({
          [field]: { contains: searchTerm, mode: "insensitive" },
        })),
      };
    }
    return this;
  }

  // *Filter*
  filter() {
    const queryObj = { ...this.query };
    const excludeFields = [
      "searchTerm",
      "sort",
      "limit",
      "page",
      "fields",
      "latitude",
      "longitude",
    ];
    excludeFields.forEach((field) => delete queryObj[field]);

    const formattedFilters: Record<string, any> = {};
    for (const [key, value] of Object.entries(queryObj)) {
      if (typeof value === "string" && value.includes("[")) {
        const [field, operator] = key.split("[");
        const op = operator.slice(0, -1);
        formattedFilters[field] = { [`${op}`]: parseFloat(value as string) };
      } else {
        formattedFilters[key] = value;
      }
    }

    this.prismaQuery.where = {
      ...this.prismaQuery.where,
      ...formattedFilters,
    };

    return this;
  }

  // *Sorting*
  sort() {
    const sort = (this.query.sort as string)?.split(",") || ["-createdAt"];
    const orderBy = sort
      .filter((field) => field !== "price" && field !== "-price")
      .map((field) => {
        if (field.startsWith("-")) {
          return { [field.slice(1)]: "desc" };
        }
        return { [field]: "asc" };
      });

    this.prismaQuery.orderBy = orderBy;
    return this;
  }

  // *Raw Filter*
  rawFilter(filters: Record<string, any>) {
    this.prismaQuery.where = {
      ...this.prismaQuery.where,
      ...filters,
    };
    return this;
  }

  // rawFilter(filters: Record<string, any>) {
  //   this.prismaQuery.where = {
  //     ...(this.prismaQuery.where || {}),
  //     ...filters,
  //   };
  //   return this;
  // }
  
  
  

  // *Add Post-Processing*
  addPostProcessor(processor: (data: any[]) => any[]) {
    this.postProcessors.push(processor);
    return this;
  }

  // *Pagination*
  paginate() {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const skip = (page - 1) * limit;

    this.prismaQuery.skip = skip;
    this.prismaQuery.take = limit;

    return this;
  }

  // **Custom Select Fields**
  select(selectFields: Record<string, boolean>) {
    this.prismaQuery.select = {
      ...this.prismaQuery.select,
      ...selectFields,
    };
    return this;
  }

  // *Fields Selection*
  fields() {
    const fields = (this.query.fields as string)?.split(",") || [];
    if (fields.length > 0) {
      this.prismaQuery.select = fields.reduce(
        (acc: Record<string, boolean>, field) => {
          acc[field] = true;
          return acc;
        },
        {}
      );
    }
    return this;
  }

  // *Include Related Models*
  include(includableFields: Record<string, boolean | object>) {
    this.prismaQuery.include = {
      ...this.prismaQuery.include,
      ...includableFields,
    };
    return this;
  }

  // *Execute Query*
  async execute() {
    // First get all results without pagination for post-processing
    const allResults = await this.model.findMany({
      ...this.prismaQuery,
      skip: undefined,
      take: undefined,
    });

    // Apply all post-processors
    let processedResults = [...allResults];
    for (const processor of this.postProcessors) {
      processedResults = processor(processedResults);
    }

    // Apply pagination after all processing
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    return processedResults.slice(startIndex, startIndex + limit);
  }

  // *Count Total*
  async countTotal() {
    const allResults = await this.model.findMany({
      ...this.prismaQuery,
      skip: undefined,
      take: undefined,
    });

    // Apply post-processors to get correct count
    let processedResults = [...allResults];
    for (const processor of this.postProcessors) {
      processedResults = processor(processedResults);
    }

    const total = processedResults.length;
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const totalPage = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPage,
    };
  }
}

export default QueryBuilder;
