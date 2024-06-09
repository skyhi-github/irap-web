<template>
  <div>
    <h1><img src="../assets/bowker-logo.svg" alt="Bowker" width="80" height="80">Bowker IRAP</h1>

    <form @submit.prevent="date">

          <div class="input-container">

            <div class="input-group">
              <el-input v-model="mo" style="width: 240px" placeholder="MO" clearable/>
            </div>

            <div class="input-group">
              <el-input v-model="cpo" style="width: 240px" placeholder="CPO" clearable/>
            </div>

            <div class="input-group">
              <el-input v-model="working_no" style="width: 240px" placeholder="Working No" clearable/>
            </div>

            <div class="input-group">
              <el-input v-model="article" style="width: 240px" placeholder="Article" clearable/>
            </div>

            <div class="input-group">
              <el-date-picker v-model="tc_podd" style="width: 240px" placeholder="TC PODD" clearable/>
            </div>

          </div>

          <el-button @click="query" type="primary" class="margin-down" :disabled="isDisabled">
            🔍 Query
          </el-button>
    </form>

    <el-table :data="inspectionData !== null ? inspectionData.slice(start, end) : []" height="400" border style="width: 100%">

        <el-table-column prop="cpo" label="CPO"/>
        <el-table-column prop="mo" label="MO" width="auto"/>
        <el-table-column prop="article" label="Article"/>
        <el-table-column prop="working_no" label="Working No"/>
        <el-table-column prop="country" label="Country"/>
        <el-table-column prop="tc_podd" label="TC PODD"/>
        <el-table-column prop="mo_order_qty" label="MO Order Qty"/>
        <el-table-column prop="sample_size" label="Sample Size"/>
        <el-table-column prop="inspect_from" label="Ins. From"/>
        <el-table-column prop="inspector_name" label="Ins. Name"/>
        <el-table-column prop="inspect_date" label="Ins. Date"/>
        <el-table-column prop="inspect_result" label="Ins. Result">
          <template #default="{ row }">
            <span class="pass" v-if="row.inspect_result">✅ Pass</span>
            <span class="fail" v-else>❌ Fail</span>
          </template>
        </el-table-column>

        <el-table-column fixed="left" label="Action" width="130">
          <template #default="{ row, $index }">
            <el-button link type="danger" size="small" @click="deleteItem(row.id, $index)">⛔</el-button>
            <el-button link type="primary" size="small" @click="dialogEditMode($index)">✏️</el-button>
          </template>
        </el-table-column>

    </el-table>

    <el-pagination background layout="prev, pager, next" :total="inspectionData.length" :page-size="pageSize" @current-change="handlePageChange" />

    <div class="button-container">

      <div class="add-item-container" v-if="!isEditing">
        <el-button class="button" @click="dialogFormVisibleClick()">➕ Add Data</el-button>
      </div>

      <div class="excel-download-container" v-if="!isEditing">
        <el-button class="button-excel" @click="downloadExcel()">📄 Export Excel</el-button>
      </div>

    </div>

    <el-dialog v-model="showAddForm" title="➕ Add New Data">
    <el-form :model="newItem" class="custom-form">
      MO
      <el-autocomplete
          v-model="irap.value"
          :fetch-suggestions="querySearchAsync"
          placeholder="MO"
          @select="handleSelect"
          clearable
      />
      CPO
      <el-input
          v-model="irap.cpo"
          placeholder="CPO"
          clearable
      />
      Article
      <el-input
          v-model="irap.article"
          placeholder="Article"
          clearable
      />
      Working No
      <el-input
          v-model="irap.working_no"
          placeholder="Working No"
          clearable
      />
      Country/Site
      <el-input
          v-model="irap.country"
          placeholder="Country"
          clearable
      />
      TC PODD
      <el-date-picker
          v-model="irap.tc_podd"
          placeholder="TC PODD"
          clearable
      />
      MO Order Qty
      <el-input-number
          v-model="irap.mo_order_qty"
          placeholder="Order Qty"
          clearable
      />
      Sample Size
      <el-input-number
          v-model="irap.sample_size"
          placeholder="Sample Size"
          clearable
      />
      Inspection Date
      <el-date-picker
          v-model="newItem.inspect_date"
          placeholder="Inspection Date"
          clearable
      />
      Inspection From
      <el-input
          style="width: 150px"
          v-model="newItem.inspect_from"
          placeholder="Inspection From"
          clearable
      />
      Inspector Name
      <el-input
          style="width: 150px"
          v-model="newItem.inspector_name"
          placeholder="Inspector Name"
          clearable
      />
      Inspect Result
      <el-radio-group v-model="newItem.inspect_result" size="medium" class="radio">
        <el-radio :label="true" class="green">Pass🟢</el-radio>
        <el-radio :label="false" class="red">Fail🔴</el-radio>
      </el-radio-group>
    <template v-if="!newItem.inspect_result">
      Issue
      <el-input
          v-model="newItem.issue"
          maxlength="1000"
          placeholder="Issue"
          clearable
      />
      Department
      <el-input
          style="width: 150px"
          v-model="newItem.department"
          placeholder="🏢 Department"
          clearable
      />
      Person In Charge
      <el-input
          style="width: 180px"
          v-model="newItem.person_in_charge"
          placeholder="🙋🏻 Person In Charge"
          clearable
      />
      Root Cause
      <el-input
          type="textarea"
          v-model="newItem.root_cause"
          placeholder="Root Cause"
          maxlength="1000"
          show-word-limit
          clearable
      />
      Action
      <el-input
          type="textarea"
          v-model="newItem.action"
          placeholder="Action"
          maxlength="1000"
          show-word-limit
          clearable
      />
      Prevention
      <el-input
          type="textarea"
          v-model="newItem.prevention"
          placeholder="Prevention"
          maxlength="1000"
          show-word-limit
          clearable
      />
    </template>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="danger" @click="dialogFormVisibleCancel()">Cancel</el-button>
        <el-button type="primary" @click="saveAddForm()">
          Confirm
        </el-button>
      </div>
    </template>
    </el-dialog>

    <el-dialog v-model="showEditForm" title="✏️ Edit Item">
      <el-form  :model="editedItem">

        <el-form :model="newItem" class="custom-form">
      MO
      <el-input
          v-model="editedItem.mo"
          :fetch-suggestions="querySearchAsync"
          placeholder="MO"
          @select="handleSelect"
          clearable
      />
      CPO
      <el-input
          v-model="editedItem.cpo"
          placeholder="CPO"
          clearable
      />
      Article
      <el-input
          v-model="editedItem.article"
          placeholder="Article"
          clearable
      />
      Working No
      <el-input
          v-model="editedItem.working_no"
          placeholder="Working No"
          clearable
      />
      Country/Site
      <el-input
          v-model="editedItem.country"
          placeholder="Country"
          clearable
      />
      TC PODD
      <el-date-picker
          v-model="editedItem.tc_podd"
          placeholder="TC PODD"
          clearable
      />
      MO Order Qty
      <el-input
          v-model="editedItem.mo_order_qty"
          placeholder="Qty"
          style="width: 90px"
          clearable
      />
      Sample Size
      <el-input
          v-model="editedItem.sample_size"
          placeholder="Qty"
          style="width: 90px"
          clearable
      />
      Inspection Date
      <el-date-picker
          v-model="editedItem.inspect_date"
          placeholder="Inspection Date"
          clearable
      />
      Inspection From
      <el-input
          style="width: 150px"
          v-model="editedItem.inspect_from"
          placeholder="Inspection From"
          clearable
      />
      Inspection Name
      <el-input
          style="width: 150px"
          v-model="editedItem.inspector_name"
          placeholder="Inspector Name"
          clearable
      />
      Inspect Result
      <el-radio-group v-model="editedItem.inspect_result" size="medium" class="radio">
        <el-radio :label="true" class="green">Pass🟢</el-radio>
        <el-radio :label="false" class="red">Fail🔴</el-radio>
      </el-radio-group>
    <template v-if="!editedItem.inspect_result">
      Issue
      <el-input
          v-model="editedItem.issue"
          maxlength="1000"
          placeholder="Issue"
          clearable
      />
      Department
      <el-input
          style="width: 150px"
          v-model="editedItem.department"
          placeholder="🏢 Department"
          clearable
      />
      Person In Charge
      <el-input
          style="width: 180px"
          v-model="editedItem.person_in_charge"
          placeholder="🙋🏻 Person In Charge"
          clearable
      />
      Root Cause
      <el-input
          type="textarea"
          v-model="editedItem.root_cause"
          placeholder="Root Cause"
          maxlength="1000"
          show-word-limit
          clearable
      />
      Action
      <el-input
          type="textarea"
          v-model="editedItem.action"
          placeholder="Action"
          maxlength="1000"
          show-word-limit
          clearable
      />
      Prevention
      <el-input
          type="textarea"
          v-model="editedItem.prevention"
          placeholder="Prevention"
          maxlength="1000"
          show-word-limit
          clearable
      />
    </template>
    </el-form>

      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="danger" @click="dialogFormVisibleCancel()">Cancel</el-button>
          <el-button type="primary" @click="saveEditedItem()">Update</el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script>

import axios from 'axios';
import { ElMessage } from 'element-plus';
import { omitBy, isEmpty } from 'lodash';
import * as XLSX from 'xlsx';

export default {

  computed: {
    // Computed property to check if any item is in edit mode
    isEditing() {
      return this.inspectionData.some(item => item.editMode);
    }
  },

  methods: {

    handlePageChange(currentPage) {

      this.start = (currentPage - 1) * this.pageSize;

      this.end = currentPage * this.pageSize;

      if(currentPage == 1) {
        this.isDisabled = false;
      }

      if(currentPage > 1) {
        this.isDisabled = true;
      }
    },

    async fetchInspectionData(mo, cpo, article, working_no, tc_podd) {

      const query = { mo: mo, cpo: cpo, article: article, working_no: working_no, tc_podd: tc_podd };

      const filteredQuery = omitBy(query, isEmpty);


      if (mo == '' && cpo == '' && article == '' && working_no == '' && tc_podd == '')

      {

        try {
        const response = await axios.get(`http://localhost:3000/v1/irap`);
        this.inspectionData = response.data.map(data => ({
          ...data,
          editMode: false,
          editedValues: { ...data }, // Store edited values separately
        }));
      } catch (error) {
        console.error('Error fetching inspection data:', error);
      }

      }

      else if (mo != '' | cpo != '' | article != '' | working_no != '' | tc_podd != '') {


      try {
      const response = await axios.get(`http://localhost:3000/v1/irap`, { params: filteredQuery });
      this.inspectionData = response.data.map(data => ({
        ...data,
        editMode: false,
        editedValues: { ...data }, // Store edited values separately
        }));
      } catch (error) {
        console.error('Error fetching inspection data:', error);
      }

      }

    },

    result(result) {
      if(result == true) {
        return "Pass"
      }
      else if(result == false) {
        return "Fail"
      }
    },

    async downloadExcel() {

      const data = this.inspectionData.map(item => ({
          "MO": item.mo,
          "CPO": item.cpo,
          "Article": item.article,
          "Working No": item.working_no,
          "Country/Site": item.country,
          "MO Order Qty": item.mo_order_qty,
          "Sample Size": item.sample_size,
          "TC PODD": item.tc_podd,
          "Inspection From": item.inspect_from,
          "Inspector Name": item.inspector_name,
          "Inspect Date": item.inspect_date,
          "Inspect Result": this.result(item.inspect_result),
          "Key Person & Responsibility": item.person_in_charge,
          "Department": item.department,
          "Issue": item.issue,
          "Root Cause": item.root_cause,
          "Action": item.action,
          "Prevention": item.prevention
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      ws['!cols'] = [
          { wch: 13 }, // A
          { wch: 10 }, // B
          { wch: 8 },  // C
          { wch: 16 }, // D
          { wch: 20 }, // E
          { wch: 15 }, // F
          { wch: 15 }, // G
          { wch: 12 }, // H
          { wch: 20 }, // I
          { wch: 15 }, // J
          { wch: 15 }, // K
          { wch: 12 }, // L
          { wch: 23 }, // M
          { wch: 15 }, // N
          { wch: 15 }, // O
          { wch: 15 }, // P
          { wch: 15 }, // Q
          { wch: 18 }, // R
        ]
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

      // Convert workbook to buffer (memory representation)
      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
      const date = new Date;
      const nowDate = this.getFormattedDate(date);
      const time = this.formatAMPM(new Date);

      // Simulate a click on a hidden anchor element to trigger download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      link.download = `${nowDate}-${time}-irap.xlsx`; // Set filename
      link.style.display = 'none'; // Hide the anchor element
      document.body.appendChild(link);
      link.click();

      // Clean up the temporary URL object
      URL.revokeObjectURL(link.href);
      document.body.removeChild(link);

    },
    
    async deleteItem(id, index) {
      try {
        const response = await axios.delete(`http://localhost:3000/v1/irap/${id}`);
        // Assuming the response contains some data with a message
        const message = response.data;
        // Assuming you have some way to display a popup dialog with the message
        ElMessage({message, type: 'error'});
        
        // If the delete request was successful, remove the item from the inspectionData array
        this.inspectionData.splice(index, 1);
      } catch (error) {
        // If there's an error, handle it appropriately
        console.error('Error deleting item:', error);
        // Show an error message or handle it in some other way
        this.showPopupDialog(`Error deleting item. Please try again later (ID ${id})`);
      }
    },

    async saveAddForm() {

      try {
      // Make a POST request to the API endpoint with the data from newItem

      this.newItem.inspect_date = this.getFormattedDate(this.newItem.inspect_date);

      const response = await axios.post(`http://localhost:3000/v1/irap`, this.newItem);

      // Assuming the response contains some data with a message

      // Show a popup dialog with the message
      ElMessage({message: `Created A New Data ID: ${response.data.id}`, type: 'success'});

      // Reset newItem object to clear the form fields
      this.newItem = {
        cpo: '',
        mo: '',
        article: '',
        working_no: '',
        country: '',
        mo_order_qty: '',
        inspect_date: '',
        inspect_result: true,
        issue: '',
        root_cause: '',
        action: '',
        prevention: '',
        inspect_from: '',
        inspector_name: '',
        person_in_charge: '',
        department: '',
      };

      this.irap = {
        cpo: '',
        mo: '',
        article: '',
        working_no: '',
        country: '',
        mo_order_qty: '',
        inspect_date: '',
        inspect_result: true,
        issue: '',
        root_cause: '',
        action: '',
        prevention: '',
        inspect_from: '',
        inspector_name: '',
        person_in_charge: '',
        department: '',
      };

      // Close the add form
      this.showAddForm = false;

      // Refresh inspection data to update the table with the newly added item
      this.fetchInspectionData();
      } catch (error) {
      // If there's an error, handle it appropriately
      console.error('Error saving new item:', error);
      // Show an error message or handle it in some other way
      ElMessage({ message: 'Error saving new item. Please try again later.', type: 'error' });
      }

    },

    saveItem(index) {
      const rowData = this.inspectionData[index];
      // Assuming you have some validation logic here to ensure data integrity
      
      // Extract only the edited values from the rowData
      const editedData = {
        leader_name: rowData.leader_name,
        line: rowData.line,
        po: rowData.po,
        style: rowData.style,
        article: rowData.article,
        inspection_date_only: rowData.inspection_date_only,
        inspection_quantity: rowData.inspection_quantity,
        defect_name: rowData.defect_name,
        defect_quantity: rowData.defect_quantity,
        remark: rowData.remark
      };
      
      // Send the edited data to the server using PUT method
      axios.put(`http://localhost:3000/v1/irap/${rowData.id}`, editedData)
        .then(response => {
          // Assuming the response contains some data with a message
          const message = `update success id ${response.data.id}`;
          // Show a popup dialog with the message
          ElMessage({ message, type: 'success' });
          
          // Update the original data with the edited data
          Object.assign(rowData, editedData);
          // Exit edit mode
          rowData.editMode = false;
        })
        .catch(error => {
          // If there's an error, handle it appropriately
          console.error('Error saving item:', error);
          // Show an error message or handle it in some other way
          ElMessage('Error saving item. Please try again later.');
        });
    },

    toggleEditMode(index) {
      // Toggle edit mode for the specified row
      const rowData = this.inspectionData[index];
      if (!rowData.editMode) {
        // Enter edit mode: initialize editedValues with original data
        rowData.editedValues = { ...rowData };
      }
      rowData.editMode = !rowData.editMode;
    },

    showPopupDialog(message) {
      ElMessage({message, type: 'error'}); // For simplicity, just using alert for demonstration purposes
    },

    cancelEdit(index) {
      const rowData = this.inspectionData[index];
      // Check if the item is newly added; if yes, remove it from the inspectionData array
      if (rowData.isNew) {
        this.inspectionData.splice(index, 1);
      } else {
        // If it's not newly added, just set editMode to false to hide the input fields
        rowData.editMode = false;
      }
    },

    saveNewItem() {
      this.showAddForm = false;
    },

    getFormattedDate(date) {

    if (date) {

    const newDate = new Date(date);

    const year = newDate.getFullYear();
    const month = newDate.getMonth() + 1;
    const day = newDate.getDate().toString().padStart(2, "0");

    // Get single-character month and day (if under 10)
    const formattedMonth = month.toString().padStart(2, "0");
    const formattedDay = day < 10 ? `${day}` : day.toString();
    const formattedDate = `${year}-${formattedMonth}-${formattedDay}`;

    return formattedDate;
    }

    else return;
    },

    formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
    },

    query() {

      this.inspectionData == null;

      const mo = this.mo;
      const cpo = this.cpo;
      const article = this.article;
      const working_no = this.working_no;
      const tc_podd = this.getFormattedDate(this.tc_podd);

      this.fetchInspectionData(mo, cpo, article, working_no, tc_podd)

    },

    dialogEditMode(index) {
    // Retrieve the row data corresponding to the index
    const rowData = this.inspectionData[index];

    console.log(rowData);

    // Set the row data as editedItem
    this.editedItem = { ...rowData };

    if(this.editedItem.inspect_result == true) {
      this.editedItem.issue = '';
      this.editedItem.root_cause = '';
      this.editedItem.action = '';
      this.editedItem.prevention = '';
    }

    // Set the visibility of the dialog to true
    this.showEditForm = true;
    },

    saveEditedItem() {

    this.editedItem.inspect_date = this.getFormattedDate(this.editedItem.inspect_date);

    axios.put(`http://localhost:3000/v1/irap/${this.editedItem.id}`, this.editedItem)
      .then(response => {
        console.log('Item updated successfully');

        this.fetchInspectionData('', '', '', '', '');

        // Show a popup dialog with the message
        ElMessage({ message: `update success id ${response.data.id}`, type: 'success'})

        // Update the original data with the edited data

        // Close the dialog
        this.showEditForm = false;
      })
      .catch(error => {
        console.error('Error updating item:', error);

        // Show an error message or handle it in some other way
        ElMessage('Error saving item. Please try again later.');

        // Close the dialog or show an error message
        this.showEditForm = false;
      });
    },

    dialogFormVisibleClick() {
      this.showAddForm = true;
    },

    dialogFormVisibleCancel() {
      this.showEditForm = false;
      this.showAddForm = false;
      this.newItem.inspect_result = true;
      this.newItem.inspect_date = '',

      this.irap = {
        value: '',
        cpo: '',
        article: '',
        working_no: '',
        country: '',
        tc_podd: '',
        mo_order_qty: '',
        issue: '',
      };
    },

    querySearchAsync(queryString, cb) {
      const results = queryString
        ? this.links.filter(this.createFilter(queryString))
        : this.links;

      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        cb(results);
      }, 100 * Math.random());
    },

    createFilter(queryString) {
      return (irap) => {
        return irap.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0;
      };
    },

    handleSelect(item) {
      this.irap.value = item.value
      this.irap.cpo = item.cpo;
      this.irap.article = item.article;
      this.irap.tc_podd = item.tc_podd;
      this.irap.country = item.country;
      this.irap.mo_order_qty = item.mo_order_qty;
      this.irap.working_no = item.working_no;
      this.irap.sample_size = item.sample_size;

      this.newItem.mo = item.value;
      this.newItem.cpo = item.cpo;
      this.newItem.article = item.article;
      this.newItem.working_no = item.working_no;
      this.newItem.tc_podd = item.tc_podd;
      this.newItem.country = item.country;
      this.newItem.mo_order_qty = item.mo_order_qty;
      this.newItem.sample_size = item.sample_size;
      this.newItem.inspect_date = this.getFormattedDate(new Date);
    },

    async loadAll() {
      try {
      const response = await axios.get(`http://localhost:3000/v1/irap/json`);
      this.links = response.data
      } catch (error) {
        console.error('Error fetching inspection data:', error);
      }
    },

  },

  mounted() {
    this.fetchInspectionData();
    this.loadAll();
  },

  data() {
    return {
      start: 0, // Current page (starts at 1)
      end: 10,
      isDisabled: false,
      pageSize: 10, // Number of items per page
      irap: {
        value: '',
        cpo: '',
        article: '',
        country: '',
        tc_podd: '',
        mo_order_qty: '',
        working_no: '',
        sample_size: '',
        inspect_from: '',
        inspector_name: '',
        person_in_charge: '',
        department: '',
      },

      links: [],
      inspectionData: [],
      mo: '',
      cpo: '',
      article: '',
      working_no: '',
      tc_podd: '',
      showAddForm: false,
      showEditForm: false,
      date: '',
      newItem: {
        cpo: '',
        mo: '',
        article: '',
        working_no: '',
        country: '',
        mo_order_qty: '',
        sample_size: '',
        inspect_date: '',
        inspect_result: true,
        issue: '',
        root_cause: '',
        action: '',
        prevention: '',
        inspect_from: '',
        inspector_name: '',
        person_in_charge: '',
        department: '',
    },
      editedItem: {},
      formLabelWidth: '140px',
    };
  },

}
</script>

<style scoped>

.pass {
  font-weight: bold;
  color: #00d26a;
}

.fail {
  font-weight: bold;
  color: red
}

.custom-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  text-align: center;
}

.custom-form .radio {
  margin-right: 250px;
  display: flex;
}

.custom-form .radio .green{
  color: #00d26a;
  font-weight: bold;
}

.custom-form .radio .red{
  color: red;
  font-weight: bold;
}

.form-inline {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
}

h1 {
  color: #1A097E;
  font-family:fantasy
}

h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

table {
  border-collapse: collapse;
  width: 100%;
  border: 1px solid #ddd;
  overflow: hidden; /* Hide overflowing content */
}

thead {
  top: 0;
  z-index: 1;
}

th, td {
  text-align: center;
  white-space: nowrap;
  padding: 16px;
  border-style: solid;
  border-color: rgb(25, 75, 25);
}


th {
  background-color: yellow;
  top: 0; /* Stick to the top of the viewport */
  z-index: 1; /* Ensure it's above the content */
}

img {
  margin-bottom: -24px;
}

tr:nth-child(even){background-color: #f2f2f2}


.table-container {
  max-height: 400px; /* Set the maximum height for scrolling */
  overflow-y: auto; /* Enable vertical scrolling */
}

.add-item-container {
  margin-right: 60px;
  margin-bottom: 15px;
  text-align: left;
}

.excel-download-container {
  margin-right: 60px;
  margin-bottom: 15px;
  text-align: right;
}

/* CSS for the popup form */
.popup-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent black overlay */
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup-form {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
}

.popup-form h2 {
  margin-top: 0;
}

.popup-form label {
  display: block;
  margin-bottom: 5px;
}

.popup-form input {
  width: 100%;
  /* padding: 8px; */
  margin-bottom: 10px;
}

.popup-form button {
  padding: 8px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.popup-form button:hover {
  background-color: #0056b3;
}

.input-container {
  display: flex;
  justify-content: center;
}

.button-container {
  display: flex;
  justify-content: center;
}

.input-container div {
  margin-right: 15px; /* Adjust the value as needed */
}

.input-group {
  display: flex;
  align-items: center; /* Align items vertically in the center */
  margin-bottom: 10px;
  flex-direction: row; /* Ensure items are positioned horizontally */
}

.input-group label {
  flex: 3;
  margin-right: 10px;
  white-space: nowrap;
  text-align: center; /* Align the label text to the right */
}

.input-group input {
  display: inline-block;
  float: none;
  width:auto;
  margin:auto 0 0 0; 
  padding:5px 5px;
}

.button {
  background-color: rgb(76, 161, 231);
  border: none;
  color: #1A097E;
  padding: 11px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  border-radius: 15px;
  cursor: pointer;
}

.button-excel {
  background-color: #BAD80A;
  border: none;
  color: #1D6F42;
  padding: 11px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  border-radius: 15px;
  cursor: pointer;
}

.button:hover {
  color: white;
  background-color: #087ae6;
  font-weight: bold;
}

.button-excel:hover {
  color: white;
  background-color: #1D6F42;
  font-weight: bold;
}

.margin-down {
  margin-bottom: 20px;
}

</style>
