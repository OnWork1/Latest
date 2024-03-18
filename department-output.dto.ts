import { type Department } from '@prisma/client';

export default class DepartmentOutputDto {
  constructor(
    public id: number,
    public departmentName: string,
    public departmentCode: string
  ) {}

  static fromEntity(data: Department | null) {
    if (data) {
      return new DepartmentOutputDto(
        data.id,
        data.departmentName,
        data.departmentCode
      );
    } else return null;
  }

  static fromEntityArray(data: Department[]) {
    const departmentList: DepartmentOutputDto[] = [];
    data.forEach((department) => {
      const departmentObj = this.fromEntity(department);
      if (departmentObj) departmentList.push(departmentObj);
    });
    return departmentList;
  }
}
