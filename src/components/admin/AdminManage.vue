<template>
    <div>
        <div style="margin-bottom: 5px;">
            <el-input v-model="name" placeholder="请输入名字" suffix-icon="el-icon-search" style="width: 200px;" @keyup.enter.native="loadPost"></el-input>
            <el-select v-model="sex" filterable placeholder="请选择性别" style="margin-left: 5px;">
                <el-option v-for="item in sexs" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
            <el-button type="primary" style="margin-left: 5px;" @click="loadPost">查询</el-button>
            <el-button type="success" @click="resetParam">重置</el-button>
            <el-button type="primary" style="margin-left: 5px;" @click="add">新增</el-button>
        </div>
        <el-table :data="tableData" :header-cell-style="{ background: '#f2f5fc', color: '#555555' }" border>
            <el-table-column prop="id" label="ID" width="60"></el-table-column>
            <el-table-column prop="no" label="账号" width="180"></el-table-column>
            <el-table-column prop="name" label="姓名" width="180"></el-table-column>
            <el-table-column prop="age" label="年龄" width="80"></el-table-column>
            <el-table-column prop="sex" label="性别" width="80">
                <template #default="{ row }">
                    <el-tag :type="row.sex === 1 ? 'primary' : 'success'">{{ row.sex === 1 ? '男' : '女' }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="roleId" label="角色" width="120">
                <template #default="{ row }">
                    <el-tag :type="getRoleType(row.roleId)">{{ getRoleLabel(row.roleId) }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="phone" label="电话" width="180"></el-table-column>
            <el-table-column label="操作">
                <template #default="{ row }">
                    <el-button size="small" type="success" @click="mod(row)">编辑</el-button>
                    <el-popconfirm title="确定删除吗？" @confirm="del(row.id)" style="margin-left: 5px;">
                        <el-button slot="reference" size="small" type="danger">删除</el-button>
                    </el-popconfirm>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNum" :page-sizes="[5, 10, 20, 30]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>

        <el-dialog title="提示" :visible.sync="centerDialogVisible" width="30%" center>
            <el-form ref="form" :rules="rules" :model="form" label-width="80px">
                <el-form-item label="账号" prop="no">
                    <el-input v-model="form.no"></el-input>
                </el-form-item>
                <el-form-item label="名字" prop="name">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="form.password" type="password"></el-input>
                </el-form-item>
                <el-form-item label="年龄" prop="age">
                    <el-input v-model="form.age"></el-input>
                </el-form-item>
                <el-form-item label="性别">
                    <el-radio-group v-model="form.sex">
                        <el-radio label="1">男</el-radio>
                        <el-radio label="0">女</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="电话" prop="phone">
                    <el-input v-model="form.phone"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="centerDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="save">确定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: "AdminManage",
    data() {
        return {
            tableData: [],
            pageSize: 10,
            pageNum: 1,
            total: 0,
            name: '',
            sex: '',
            sexs: [
                { value: '1', label: '男' },
                { value: '0', label: '女' }
            ],
            centerDialogVisible: false,
            form: {
                id: '',
                no: '',
                name: '',
                password: '',
                age: '',
                phone: '',
                sex: '0',
                roleId: '1'
            },
            rules: {
                no: [
                    { required: true, message: '请输入账号', trigger: 'blur' },
                    { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' },
                    { validator: this.checkDuplicate, trigger: 'blur' }
                ],
                name: [{ required: true, message: '请输入名字', trigger: 'blur' }],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' }
                ],
                age: [
                    { required: true, message: '请输入年龄', trigger: 'blur' },
                    { pattern: /^[1-9][0-9]{0,2}$/, message: '年龄必须为正整数字', trigger: 'blur' },
                    { validator: this.checkAge, trigger: 'blur' }
                ],
                phone: [
                    { required: true, message: "手机号不能为空", trigger: "blur" },
                    { pattern: /^1[3-9][0-9]{9}$/, message: "请输入正确的手机号码", trigger: "blur" }
                ]
            }
        };
    },
    methods: {
        checkAge(rule, value, callback) {
            value > 150 ? callback(new Error('年龄输入过大')) : callback();
        },
        checkDuplicate(rule, value, callback) {
            if (this.form.id) return callback();
            this.$axios.get(`${this.$httpUrl}/user/findByNo`, { params: { no: this.form.no } })
                .then(({ data: res }) => res.code !== 200 ? callback() : callback(new Error('账号已经存在')));
        },
        getRoleType(roleId) {
            return roleId === 0 ? 'danger' : roleId === 1 ? 'primary' : 'success';
        },
        getRoleLabel(roleId) {
            return roleId === 0 ? '超级管理员' : roleId === 1 ? '管理员' : '用户';
        },
        resetForm() {
            this.$refs.form.resetFields();
        },
        del(id) {
            this.$axios.get(`${this.$httpUrl}/user/del`, { params: { id } })
                .then(({ data: res }) => {
                    this.$message({ message: res.code === 200 ? '操作成功！' : '操作失败！', type: res.code === 200 ? 'success' : 'error' });
                    if (res.code === 200) this.loadPost();
                });
        },
        mod(row) {
            this.centerDialogVisible = true;
            this.$nextTick(() => Object.assign(this.form, { ...row, password: '' }));
        },
        add() {
            this.centerDialogVisible = true;
            this.$nextTick(this.resetForm);
        },
        doSave() {
            this.$axios.post(`${this.$httpUrl}/user/save`, this.form)
                .then(({ data: res }) => {
                    this.$message({ message: res.code === 200 ? '操作成功！' : '操作失败！', type: res.code === 200 ? 'success' : 'error' });
                    if (res.code === 200) this.afterSave();
                });
        },
        doMod() {
            this.$axios.post(`${this.$httpUrl}/user/update`, this.form)
                .then(({ data: res }) => {
                    this.$message({ message: res.code === 200 ? '操作成功！' : '操作失败！', type: res.code === 200 ? 'success' : 'error' });
                    if (res.code === 200) this.afterSave();
                });
        },
        afterSave() {
            this.centerDialogVisible = false;
            this.loadPost();
            this.resetForm();
        },
        save() {
            this.$refs.form.validate(valid => valid && (this.form.id ? this.doMod() : this.doSave()));
        },
        handleSizeChange(val) {
            this.pageSize = val;
            this.pageNum = 1;
            this.loadPost();
        },
        handleCurrentChange(val) {
            this.pageNum = val;
            this.loadPost();
        },
        resetParam() {
            this.name = '';
            this.sex = '';
        },
        loadPost() {
            this.$axios.post(`${this.$httpUrl}/user/listPageC1`, {
                pageSize: this.pageSize,
                pageNum: this.pageNum,
                param: { name: this.name, sex: this.sex, roleId: '1' }
            }).then(({ data: res }) => {
                if (res.code === 200) {
                    this.tableData = res.data;
                    this.total = res.total;
                } else {
                    this.$message.error('获取数据失败');
                }
            });
        }
    },
    beforeMount() {
        this.loadPost();
    }
};
</script>

<style scoped>
</style>
