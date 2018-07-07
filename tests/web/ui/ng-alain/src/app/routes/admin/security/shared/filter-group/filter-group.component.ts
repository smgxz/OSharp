import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FilterGroup, FilterRule, FilterOperate, AjaxResult, AjaxResultType, EntityProperty, FilterOperateEntry } from '@shared/osharp/osharp.model';
import { OsharpService } from '@shared/osharp/services/osharp.service';


@Component({
  selector: 'security-filter-group',
  templateUrl: './filter-group.component.html',
  styles: [`
  .group-box{margin:5px;padding:5px; border:dashed 2px #ddd;}
  `]
})
export class FilterGroupComponent implements OnChanges {

  @Input() group: FilterGroup;
  @Input() entity: string;
  @Output() remove: EventEmitter<FilterGroup> = new EventEmitter<FilterGroup>();

  entityProperties: EntityProperty[] = [];
  groupOperateEntries: FilterOperateEntry[] = [new FilterOperateEntry(FilterOperate.And), new FilterOperateEntry(FilterOperate.Or)];

  constructor(
    private osharp: OsharpService,
    private http: HttpClient
  ) {
    this.group = new FilterGroup();
    this.group.Operate = FilterOperate.Or;
  }

  ngOnChanges() {
    console.log(this.group);
    if (this.group && (!this.group.Level || this.group.Level == 1)) {
      FilterGroup.Init(this.group);
    }
    if (this.group) {
      if (!this.entity) {
        this.entityProperties = [];
        return;
      }
      this.http.get<AjaxResult>("api/admin/entityinfo/ReadProperties?typeName=" + this.entity).subscribe(res => {
        if (res.Type != AjaxResultType.Success) {
          console.log(res);
          this.osharp.error(res.Content);
          return;
        }
        this.entityProperties = res.Data;
      });
    }
  }
  addGroup() {
    if (!this.entity) {
      this.osharp.error("请选择左边的一行再进行操作");
      return;
    }
    let subGroup = new FilterGroup();
    subGroup.Level = this.group.Level + 1;
    this.group.Groups.push(subGroup);
  }
  addRule() {
    if (!this.entity) {
      this.osharp.error("请选择左边的一行再进行操作");
      return;
    }
    this.group.Rules.push(new FilterRule(null, null));
  }
  removeRule(rule: FilterRule) {
    if (rule) {
      let index = this.group.Rules.indexOf(rule);
      if (index >= 0) {
        this.group.Rules.splice(index, 1);
      }
    }
  }
  /** 删除分组按钮 */
  removeGroup() {
    this.remove.emit(this.group);
  }
  /**删除子分组的事件响应 */
  removeSubGroup(subGroup: FilterGroup) {
    if (subGroup) {
      let index = this.group.Groups.indexOf(subGroup);
      if (index >= 0) {
        this.group.Groups.splice(index, 1);
      }
    }
  }
}
