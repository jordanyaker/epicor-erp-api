const update = require('immutability-helper');

const Connection = require('../lib/connection.js'),
  Labor = require('../lib/labor.js');

describe('Labor Service', () => {
  let connection, laborSvc;

  beforeEach(() => {
    connection = new Connection({
      serverUrl: 'https://nowhere.com'
    });
    laborSvc = new Labor(connection);
  });

  describe('find', () => {
    it('calls GetRows', done => {
      const r = sinon.stub().returns(new Promise(function() {}));
      laborSvc.makeRequest = r;
      const result = laborSvc.find('testing');
      expect(result).to.have.property('on');
      result.on('data', () => {
        throw new Error('there should be no data');
      });
      setImmediate(() => {
        expect(r).to.have.been.calledWith(
          'GetRows',
          sinon.match({
            whereClauseLaborHed: 'testing',
            pageSize: 25,
            absolutePage: 0
          })
        );
        done();
      });
    });
  });

  describe('updateLaborEntry', () => {
    it('calls GetByID and recalculate the totals', () => {});

    it('updates custom laborhed data by creating new record', () => {});
  });

  describe('updateRow', () => {
    const rowCriteria = {
      FromDate: '2017-11-27',
      ToDate: '2017-11-28',
      EmployeeNum: 'TS'
    };

    it('calls DefaultLaborType if the row changes from an operation to an indirect code', () => {
      const ds = {...sampleDataset()};
      ds.parameters.ds = ds.returnObj;

      const r = sinon.stub();
      r.withArgs('GetRows', sinon.match.any).returns(Promise.resolve(ds));
      r
        .withArgs('DefaultLaborType', sinon.match.any)
        .returns(Promise.resolve(ds));
      r
        .withArgs('DefaultIndirect', sinon.match.any)
        .returns(Promise.resolve(ds));
      r
        .withArgs('DefaultProjectID', sinon.match.any)
        .returns(Promise.resolve(ds));
      r.withArgs('DefaultOprSeq', sinon.match.any).returns(Promise.resolve(ds));
      r.withArgs('DefaultJobNum', sinon.match.any).returns(Promise.resolve(ds));
      r.withArgs('Update', sinon.match.any).returns(Promise.resolve(ds));

      laborSvc.makeRequest = r;

      return laborSvc
        .updateRow(rowCriteria, {
          IndirectCode: 'foo',
          ProjectID: undefined,
          JobNum: undefined,
          OprSeq: undefined
        })
        .then(result => {
          expect(r).to.have.been.calledWith('DefaultLaborType', {
            ds: ds.returnObj,
            ipLaborType: 'I'
          });
        });
    });

    it('calls DefaultLaborType if the row changes from an indirect code to an operation', () => {
      const ds = {...sampleDataset()};
      ds.parameters.ds = ds.returnObj;

      ds.returnObj.LaborDtl.forEach(ld =>
        Object.assign(ld, {
          IndirectCode: 'foo',
          ProjectID: undefined,
          JobNum: undefined,
          OprSeq: undefined
        })
      );

      const r = sinon.stub();
      r.withArgs('GetRows', sinon.match.any).returns(Promise.resolve(ds));
      r
        .withArgs('DefaultLaborType', sinon.match.any)
        .returns(Promise.resolve(ds));
      r
        .withArgs('DefaultIndirect', sinon.match.any)
        .returns(Promise.resolve(ds));
      r
        .withArgs('DefaultProjectID', sinon.match.any)
        .returns(Promise.resolve(ds));
      r.withArgs('DefaultOprSeq', sinon.match.any).returns(Promise.resolve(ds));
      r.withArgs('DefaultJobNum', sinon.match.any).returns(Promise.resolve(ds));
      r.withArgs('Update', sinon.match.any).returns(Promise.resolve(ds));

      laborSvc.makeRequest = r;

      return laborSvc
        .updateRow(rowCriteria, {
          IndirectCode: undefined,
          OprSeq: 20,
          ProjectID: 'ICLDEL',
          JobNum: 'L01094-L25'
        })
        .then(result => {
          expect(r).to.have.been.calledWith('DefaultLaborType', {
            ds: ds.returnObj,
            ipLaborType: 'P'
          });
        });
    });

    it('calls DefaultIndirect if the indirect code changes', () => {
      const ds = {...sampleDataset()};
      ds.parameters.ds = ds.returnObj;

      ds.returnObj.LaborDtl.forEach(ld =>
        Object.assign(ld, {
          IndirectCode: 'bar',
          OprSeq: '',
          ProjectID: '',
          JobNum: ''
        })
      );

      const r = sinon.stub();
      r.withArgs('GetRows', sinon.match.any).returns(Promise.resolve(ds));
      r
        .withArgs('DefaultLaborType', sinon.match.any)
        .returns(Promise.resolve(ds));
      r
        .withArgs('DefaultIndirect', sinon.match.any)
        .returns(Promise.resolve(ds));
      r
        .withArgs('DefaultProjectID', sinon.match.any)
        .returns(Promise.resolve(ds));
      r.withArgs('DefaultOprSeq', sinon.match.any).returns(Promise.resolve(ds));
      r.withArgs('DefaultJobNum', sinon.match.any).returns(Promise.resolve(ds));
      r.withArgs('Update', sinon.match.any).returns(Promise.resolve(ds));

      laborSvc.makeRequest = r;

      return laborSvc
        .updateRow(rowCriteria, {
          IndirectCode: 'foo',
          ProjectID: undefined,
          JobNum: undefined,
          OprSeq: undefined
        })
        .then(result => {
          expect(r).to.have.been.calledWith('DefaultIndirect', {
            ds: ds.returnObj,
            indirectCode: 'foo'
          });
          expect(r).to.not.have.been.calledWith(
            'DefaultProjectID',
            sinon.match.any
          );
          expect(r).to.not.have.been.calledWith(
            'DefaultJobNum',
            sinon.match.any
          );
          expect(r).to.not.have.been.calledWith(
            'DefaultOprSeq',
            sinon.match.any
          );
        });
    });

    it('calls DefaultProjectID, DefaultJobNum and DefaultOprSeq if the project changes', () => {
      const ds = {...sampleDataset()};
      ds.parameters.ds = ds.returnObj;

      ds.returnObj.LaborDtl.forEach(ld =>
        Object.assign(ld, {
          ProjectID: 'LEDLCI',
          OprSeq: 20,
          JobNum: 'L01094-L25'
        })
      );

      const r = sinon.stub();
      r.withArgs('GetRows', sinon.match.any).returns(Promise.resolve(ds));
      r
        .withArgs('DefaultLaborType', sinon.match.any)
        .returns(Promise.resolve(ds));
      r
        .withArgs('DefaultIndirect', sinon.match.any)
        .returns(Promise.resolve(ds));
      r
        .withArgs('DefaultProjectID', sinon.match.any)
        .returns(Promise.resolve(ds));
      r.withArgs('DefaultOprSeq', sinon.match.any).returns(Promise.resolve(ds));
      r.withArgs('DefaultJobNum', sinon.match.any).returns(Promise.resolve(ds));
      r.withArgs('Update', sinon.match.any).returns(Promise.resolve(ds));

      laborSvc.makeRequest = r;

      return laborSvc
        .updateRow(rowCriteria, {
          IndirectCode: undefined,
          OprSeq: 20,
          ProjectID: 'ICLDEL',
          JobNum: 'L01094-L25'
        })
        .then(result => {
          expect(r).to.not.have.been.calledWith(
            'DefaultIndirect',
            sinon.match.any
          );
          expect(r).to.have.been.calledWith('DefaultProjectID', {
            ds: ds.returnObj,
            ipProjectID: 'ICLDEL'
          });
          expect(r).to.have.been.calledWith('DefaultJobNum', sinon.match.any);
          expect(r).to.have.been.calledWith('DefaultOprSeq', sinon.match.any);
        });
    });

    it('calls DefaultJobNum and DefaultOprSeq if the job changes', () => {
      const ds = {...sampleDataset()};
      ds.parameters.ds = ds.returnObj;

      ds.returnObj.LaborDtl.forEach(ld =>
        Object.assign(ld, {
          ProjectID: 'ICLDEL',
          OprSeq: 20,
          JobNum: 'L01094-L26'
        })
      );

      const r = sinon.stub();
      r.withArgs('GetRows', sinon.match.any).returns(Promise.resolve(ds));
      r
        .withArgs('DefaultLaborType', sinon.match.any)
        .returns(Promise.resolve(ds));
      r
        .withArgs('DefaultIndirect', sinon.match.any)
        .returns(Promise.resolve(ds));
      r
        .withArgs('DefaultProjectID', sinon.match.any)
        .returns(Promise.resolve(ds));
      r.withArgs('DefaultOprSeq', sinon.match.any).returns(Promise.resolve(ds));
      r.withArgs('DefaultJobNum', sinon.match.any).returns(Promise.resolve(ds));
      r.withArgs('Update', sinon.match.any).returns(Promise.resolve(ds));

      laborSvc.makeRequest = r;

      return laborSvc
        .updateRow(rowCriteria, {
          IndirectCode: undefined,
          OprSeq: 20,
          ProjectID: 'ICLDEL',
          JobNum: 'L01094-L25'
        })
        .then(result => {
          expect(r).to.not.have.been.calledWith(
            'DefaultIndirect',
            sinon.match.any
          );
          expect(r).to.not.have.been.calledWith(
            'DefaultProjectID',
            sinon.match.any
          );
          expect(r).to.have.been.calledWith('DefaultJobNum', {
            ds: ds.returnObj,
            jobNum: 'L01094-L25'
          });
          expect(r).to.have.been.calledWith('DefaultOprSeq', sinon.match.any);
        });
    });

    it('calls DefaultOprSeq if the operation changes', () => {
      const ds = {...sampleDataset()};
      ds.parameters.ds = ds.returnObj;

      ds.returnObj.LaborDtl.forEach(ld =>
        Object.assign(ld, {
          ProjectID: 'ICLDEL',
          OprSeq: 10,
          JobNum: 'L01094-L25'
        })
      );

      const r = sinon.stub();
      r.withArgs('GetRows', sinon.match.any).returns(Promise.resolve(ds));
      r
        .withArgs('DefaultLaborType', sinon.match.any)
        .returns(Promise.resolve(ds));
      r
        .withArgs('DefaultIndirect', sinon.match.any)
        .returns(Promise.resolve(ds));
      r
        .withArgs('DefaultProjectID', sinon.match.any)
        .returns(Promise.resolve(ds));
      r.withArgs('DefaultOprSeq', sinon.match.any).returns(Promise.resolve(ds));
      r.withArgs('DefaultJobNum', sinon.match.any).returns(Promise.resolve(ds));
      r.withArgs('Update', sinon.match.any).returns(Promise.resolve(ds));

      laborSvc.makeRequest = r;

      return laborSvc
        .updateRow(rowCriteria, {
          IndirectCode: undefined,
          OprSeq: 20,
          ProjectID: 'ICLDEL',
          JobNum: 'L01094-L25'
        })
        .then(result => {
          expect(r).to.not.have.been.calledWith(
            'DefaultIndirect',
            sinon.match.any
          );
          expect(r).to.not.have.been.calledWith(
            'DefaultProjectID',
            sinon.match.any
          );
          expect(r).to.not.have.been.calledWith(
            'DefaultJobNum',
            sinon.match.any
          );
          expect(r).to.have.been.calledWith('DefaultOprSeq', {
            ds: ds.returnObj,
            oprSeq: 20
          });
        });
    });

    it('recalls submitted entries and resubmit them', () => {
      const ds = {...sampleDataset()};
      ds.parameters.ds = ds.returnObj;

      ds.returnObj.LaborDtl.forEach(ld =>
        Object.assign(ld, {
          ProjectID: 'ICLDEL',
          OprSeq: 10,
          JobNum: 'L01094-L25'
        })
      );
      const submittedDs = {
        ...ds,
        returnObj: {
          LaborDtl: ds.returnObj.LaborDtl.map(ld => ({
            ...ld,
            NotSubmitted: false
          }))
        }
      };

      const r = sinon.stub();
      r
        .withArgs('GetRows', sinon.match.any)
        // return as submitted rows, the first time
        .onFirstCall()
        .returns(Promise.resolve(submittedDs))
        // then unsubmitted
        .onSecondCall()
        .returns(Promise.resolve(ds));
      r
        .withArgs('DefaultLaborType', sinon.match.any)
        .returns(Promise.resolve(ds));
      r
        .withArgs('DefaultIndirect', sinon.match.any)
        .returns(Promise.resolve(ds));
      r
        .withArgs('DefaultProjectID', sinon.match.any)
        .returns(Promise.resolve(ds));
      r.withArgs('DefaultOprSeq', sinon.match.any).returns(Promise.resolve(ds));
      r.withArgs('DefaultJobNum', sinon.match.any).returns(Promise.resolve(ds));
      r.withArgs('Update', sinon.match.any).returns(Promise.resolve(ds));
      r
        .withArgs('RecallFromApproval', sinon.match.any)
        .returns(Promise.resolve(ds));
      r
        .withArgs('SubmitForApproval', sinon.match.any)
        .returns(Promise.resolve(ds));

      laborSvc.makeRequest = r;

      return laborSvc
        .updateRow(rowCriteria, {
          IndirectCode: undefined,
          OprSeq: 10,
          ProjectID: 'ICLDEL',
          JobNum: 'L01094-L25'
        })
        .then(result => {
          expect(r).to.have.been.calledWith('RecallFromApproval', {
            ds: submittedDs.returnObj,
            lWeeklyView: false
          });
          expect(r).to.have.been.calledWith('SubmitForApproval', {
            ds: ds.returnObj,
            lWeeklyView: false
          });
        });
    });

    it('calls Update', () => {
      const ds = {...sampleDataset()};
      ds.parameters.ds = ds.returnObj;

      ds.returnObj.LaborDtl.forEach(ld =>
        Object.assign(ld, {
          ProjectID: 'ICLDEL',
          OprSeq: 10,
          JobNum: 'L01094-L25'
        })
      );

      const r = sinon.stub();
      r.withArgs('GetRows', sinon.match.any).returns(Promise.resolve(ds));
      r
        .withArgs('DefaultLaborType', sinon.match.any)
        .returns(Promise.resolve(ds));
      r
        .withArgs('DefaultIndirect', sinon.match.any)
        .returns(Promise.resolve(ds));
      r
        .withArgs('DefaultProjectID', sinon.match.any)
        .returns(Promise.resolve(ds));
      r.withArgs('DefaultOprSeq', sinon.match.any).returns(Promise.resolve(ds));
      r.withArgs('DefaultJobNum', sinon.match.any).returns(Promise.resolve(ds));
      r.withArgs('Update', sinon.match.any).returns(Promise.resolve(ds));

      laborSvc.makeRequest = r;

      return laborSvc
        .updateRow(rowCriteria, {
          IndirectCode: undefined,
          OprSeq: 10,
          ProjectID: 'ICLDEL',
          JobNum: 'L01094-L25'
        })
        .then(result => {
          expect(r).to.not.have.been.calledWith(
            'DefaultLaborType',
            sinon.match.any
          );
          expect(r).to.not.have.been.calledWith(
            'DefaultIndirect',
            sinon.match.any
          );
          expect(r).to.not.have.been.calledWith(
            'DefaultProjectID',
            sinon.match.any
          );
          expect(r).to.not.have.been.calledWith(
            'DefaultJobNum',
            sinon.match.any
          );
          expect(r).to.not.have.been.calledWith(
            'DefaultOprSeq',
            sinon.match.any
          );
          expect(r).to.have.been.calledWith('Update', {ds: ds.returnObj});
        });
    });
  });

  describe('submitTimesheet', () => {
    it('validates that no day has more than 24h clocked', () => {
      const r = sinon.stub();

      r.withArgs('GetRows', sinon.match.any).returns(
        Promise.resolve(
          update(sampleDataset(), {
            returnObj: {
              LaborDtl: {
                1: {
                  $merge: {
                    LaborHrs: 25
                  }
                }
              }
            }
          })
        )
      );

      laborSvc.makeRequest = r;

      return laborSvc
        .submitTimesheet(
          {
            FromDate: '2017-11-27',
            ToDate: '2017-11-28',
            EmployeeNum: 'TS'
          },
          ['2017-11-27', '2017-11-28']
        )
        .should.be.rejectedWith(/You may only clock 24 hours/);
    });

    it('only submits the dates that have been supplied by the user', () => {
      const r = sinon.stub();
      const ds = {...sampleDataset()};
      ds.parameters.ds = ds.returnObj;
      r.withArgs('GetRows', sinon.match.any).returns(Promise.resolve(ds));
      r.withArgs('Update', sinon.match.any).returns(Promise.resolve(ds));
      r
        .withArgs('SubmitForApproval', sinon.match.any)
        .returns(Promise.resolve(ds));

      laborSvc.makeRequest = r;

      return laborSvc
        .submitTimesheet(
          {
            FromDate: '2017-11-27',
            ToDate: '2017-11-28',
            EmployeeNum: 'TS'
          },
          ['2017-11-27']
        )
        .then(result => {
          expect(result.LaborDtl).to.have.length(1);
        });
    });
  });
});

const sampleDataset = () => ({
  returnObj: {
    LaborHed: [
      {
        Company: '700',
        EmployeeNum: 'TS',
        LaborHedSeq: 715627,
        PayrollDate: '2017-11-27T00:00:00',
        Shift: 1,
        ClockInDate: '2017-11-27T00:00:00',
        ClockInTime: 8,
        DspClockInTime: '08:00',
        ActualClockInTime: 8,
        ActualClockinDate: '2017-11-27T00:00:00',
        LunchStatus: 'N',
        ActLunchOutTime: 0,
        LunchOutTime: 0,
        ActLunchInTime: 0,
        LunchInTime: 0,
        ClockOutTime: 17,
        DspClockOutTime: '17:00',
        ActualClockOutTime: 17,
        PayHours: 2,
        FeedPayroll: true,
        TransferredToPayroll: false,
        LaborCollection: false,
        TranSet: '',
        ActiveTrans: false,
        ChkLink: '',
        BatchTotalHrsDisp: '',
        BatchHrsRemainDisp: '',
        BatchHrsRemainPctDisp: '',
        BatchSplitHrsMethod: '',
        BatchAssignTo: false,
        BatchComplete: false,
        BatchStartHrs: null,
        BatchEndHrs: null,
        BatchTotalHrs: 0,
        BatchHrsRemain: 0,
        BatchHrsRemainPct: 0,
        SysRevID: 1160103104,
        SysRowID: '64e8fc80-e409-48b3-9bd0-81009ea005d3',
        Imported: false,
        ImportDate: null,
        BatchMode: false,
        DspPayHours: 2,
        EmpBasicShift: 1,
        EmpBasicSupervisorID: '',
        GetNewNoHdr: false,
        ImagePath: 'empphoto/700/.bmp',
        LunchBreak: false,
        MES: false,
        TimeDisableDelete: false,
        TimeDisableUpdate: false,
        TotBurHrs: 2,
        TotLbrHrs: 2,
        WipPosted: false,
        HCMTotPayHours: 0,
        PayrollValuesForHCM: '',
        BitFlag: 8,
        EmployeeNumFirstName: 'Time',
        EmployeeNumName: 'Time Sheet',
        EmployeeNumLastName: 'Sheet',
        HCMStatusStatus: '',
        ShiftDescription: '8:00 AM to 5:00 PM',
        RowMod: '',
        Character01: '',
        Character02: 'REG',
        Character03: '',
        CheckBox01: false,
        CheckBox02: false,
        InLieuType_c: '',
        Locked_c: false,
        Number01: 0,
        Number02: 0,
        TSheetsID_c: 0,
        UD_SysRevID: 'AAAAAEUlw+U='
      },
      {
        Company: '700',
        EmployeeNum: 'TS',
        LaborHedSeq: 715628,
        PayrollDate: '2017-11-27T00:00:00',
        Shift: 1,
        ClockInDate: '2017-11-27T00:00:00',
        ClockInTime: 8,
        DspClockInTime: '08:00',
        ActualClockInTime: 8,
        ActualClockinDate: '2017-11-27T00:00:00',
        LunchStatus: 'N',
        ActLunchOutTime: 0,
        LunchOutTime: 0,
        ActLunchInTime: 0,
        LunchInTime: 0,
        ClockOutTime: 17,
        DspClockOutTime: '17:00',
        ActualClockOutTime: 17,
        PayHours: 1,
        FeedPayroll: true,
        TransferredToPayroll: false,
        LaborCollection: false,
        TranSet: '',
        ActiveTrans: false,
        ChkLink: '',
        BatchTotalHrsDisp: '',
        BatchHrsRemainDisp: '',
        BatchHrsRemainPctDisp: '',
        BatchSplitHrsMethod: '',
        BatchAssignTo: false,
        BatchComplete: false,
        BatchStartHrs: null,
        BatchEndHrs: null,
        BatchTotalHrs: 0,
        BatchHrsRemain: 0,
        BatchHrsRemainPct: 0,
        SysRevID: 1160103101,
        SysRowID: '8a34fd4f-ea14-45bd-b619-747cde29fadb',
        Imported: false,
        ImportDate: null,
        BatchMode: false,
        DspPayHours: 1,
        EmpBasicShift: 1,
        EmpBasicSupervisorID: '',
        GetNewNoHdr: false,
        ImagePath: 'empphoto/700/.bmp',
        LunchBreak: false,
        MES: false,
        TimeDisableDelete: false,
        TimeDisableUpdate: false,
        TotBurHrs: 1,
        TotLbrHrs: 1,
        WipPosted: false,
        HCMTotPayHours: 0,
        PayrollValuesForHCM: '',
        BitFlag: 8,
        EmployeeNumFirstName: 'Time',
        EmployeeNumName: 'Time Sheet',
        EmployeeNumLastName: 'Sheet',
        HCMStatusStatus: '',
        ShiftDescription: '8:00 AM to 5:00 PM',
        RowMod: '',
        Character01: '',
        Character02: 'RP',
        Character03: '',
        CheckBox01: false,
        CheckBox02: false,
        InLieuType_c: '',
        Locked_c: false,
        Number01: 0,
        Number02: 0,
        TSheetsID_c: 0,
        UD_SysRevID: 'AAAAAEUlxJ4='
      },
      {
        Company: '700',
        EmployeeNum: 'TS',
        LaborHedSeq: 715629,
        PayrollDate: '2017-11-27T00:00:00',
        Shift: 1,
        ClockInDate: '2017-11-27T00:00:00',
        ClockInTime: 8,
        DspClockInTime: '08:00',
        ActualClockInTime: 8,
        ActualClockinDate: '2017-11-27T00:00:00',
        LunchStatus: 'N',
        ActLunchOutTime: 0,
        LunchOutTime: 0,
        ActLunchInTime: 0,
        LunchInTime: 0,
        ClockOutTime: 17,
        DspClockOutTime: '17:00',
        ActualClockOutTime: 17,
        PayHours: 0,
        FeedPayroll: true,
        TransferredToPayroll: false,
        LaborCollection: false,
        TranSet: '',
        ActiveTrans: false,
        ChkLink: '',
        BatchTotalHrsDisp: '',
        BatchHrsRemainDisp: '',
        BatchHrsRemainPctDisp: '',
        BatchSplitHrsMethod: '',
        BatchAssignTo: false,
        BatchComplete: false,
        BatchStartHrs: null,
        BatchEndHrs: null,
        BatchTotalHrs: 0,
        BatchHrsRemain: 0,
        BatchHrsRemainPct: 0,
        SysRevID: 1160103119,
        SysRowID: '3a77b91d-8cdd-4cc5-b271-f6fcd368f9ec',
        Imported: false,
        ImportDate: null,
        BatchMode: false,
        DspPayHours: 0,
        EmpBasicShift: 1,
        EmpBasicSupervisorID: '',
        GetNewNoHdr: false,
        ImagePath: 'empphoto/700/.bmp',
        LunchBreak: false,
        MES: false,
        TimeDisableDelete: false,
        TimeDisableUpdate: false,
        TotBurHrs: 0,
        TotLbrHrs: 0,
        WipPosted: false,
        HCMTotPayHours: 0,
        PayrollValuesForHCM: '',
        BitFlag: 8,
        EmployeeNumFirstName: 'Time',
        EmployeeNumName: 'Time Sheet',
        EmployeeNumLastName: 'Sheet',
        HCMStatusStatus: '',
        ShiftDescription: '8:00 AM to 5:00 PM',
        RowMod: '',
        Character01: '',
        Character02: 'REG',
        Character03: '',
        CheckBox01: false,
        CheckBox02: false,
        InLieuType_c: '2',
        Locked_c: false,
        Number01: 0,
        Number02: 0,
        TSheetsID_c: 0,
        UD_SysRevID: 'AAAAAEUlxNA='
      }
    ],
    LaborDtl: [
      {
        Company: '700',
        EmployeeNum: 'TS',
        LaborHedSeq: 715627,
        LaborDtlSeq: 2179554,
        LaborType: 'P',
        LaborTypePseudo: 'P',
        ReWork: false,
        ReworkReasonCode: '',
        JobNum: 'L01094-L25',
        AssemblySeq: 0,
        OprSeq: 80,
        JCDept: 'RGELEPRD',
        ResourceGrpID: 'RGELEPRD',
        OpCode: 'OPELEASS',
        LaborHrs: 2,
        BurdenHrs: 2,
        LaborQty: 0,
        ScrapQty: 0,
        ScrapReasonCode: '',
        SetupPctComplete: 0,
        Complete: false,
        IndirectCode: '',
        LaborNote: 'Real time or bust?',
        ExpenseCode: 'MAIN',
        LaborCollection: false,
        AppliedToSchedule: false,
        ClockInMInute: 33702780,
        ClockOutMinute: 33702780,
        ClockInDate: '2017-11-27T00:00:00',
        ClockinTime: 17,
        ClockOutTime: 17,
        ActiveTrans: false,
        OverRidePayRate: 0,
        LaborRate: 0,
        BurdenRate: 20,
        DspClockInTime: '17:00',
        DspClockOutTime: '17:00',
        ResourceID: '',
        OpComplete: false,
        EarnedHrs: 0,
        AddedOper: false,
        PayrollDate: '2017-11-27T00:00:00',
        PostedToGL: false,
        FiscalYear: 0,
        FiscalPeriod: 0,
        JournalNum: 0,
        GLTrans: true,
        JournalCode: '',
        InspectionPending: false,
        CallNum: 0,
        CallLine: 0,
        ServNum: 0,
        ServCode: '',
        ResReasonCode: '',
        WipPosted: false,
        DiscrepQty: 0,
        DiscrpRsnCode: '',
        ParentLaborDtlSeq: 0,
        LaborEntryMethod: 'T',
        FiscalYearSuffix: '',
        FiscalCalendarID: '',
        BFLaborReq: false,
        ABTUID: '',
        ProjectID: 'ICLDEL',
        PhaseID: '',
        RoleCd: '',
        TimeTypCd: '',
        PBInvNum: 0,
        PMUID: 0,
        TaskSetID: '',
        ApprovedDate: '2017-11-28T00:00:00',
        ClaimRef: '',
        QuickEntryCode: '',
        TimeStatus: 'E',
        CreatedBy: 'Timesheet',
        CreateDate: '2017-11-28T00:00:00',
        CreateTime: 58919,
        ChangedBy: 'Timesheet',
        ChangeDate: '2017-11-28T00:00:00',
        ChangeTime: 58919,
        ActiveTaskID: '',
        LastTaskID: '',
        CreatedViaTEWeekView: false,
        CurrentWFStageID: '',
        WFGroupID: '',
        WFComplete: false,
        ApprovalRequired: false,
        SubmittedBy: 'Timesheet',
        PBRateFrom: '',
        PBCurrencyCode: '',
        PBHours: 0,
        PBChargeRate: 0,
        PBChargeAmt: 0,
        DocPBChargeRate: 0,
        Rpt1PBChargeRate: 0,
        Rpt2PBChargeRate: 0,
        Rpt3PBChargeRate: 0,
        DocPBChargeAmt: 0,
        Rpt1PBChargeAmt: 0,
        Rpt2PBChargeAmt: 0,
        Rpt3PBChargeAmt: 0,
        Shift: 1,
        ActID: 0,
        DtailID: 0,
        ProjProcessed: false,
        AsOfDate: null,
        AsOfSeq: 0,
        JDFInputFiles: '',
        JDFNumberOfPages: '',
        BatchWasSaved: '',
        AssignToBatch: false,
        BatchComplete: false,
        BatchRequestMove: false,
        BatchPrint: false,
        BatchLaborHrs: 0,
        BatchPctOfTotHrs: 0,
        BatchQty: 0,
        BatchTotalExpectedHrs: 0,
        JDFOpCompleted: '',
        SysRevID: 1160103091,
        SysRowID: 'fe38b3e0-45fc-496b-8e7e-3f58854a302c',
        Downtime: false,
        RefJobNum: '',
        RefAssemblySeq: 0,
        RefOprSeq: 0,
        Imported: false,
        ImportDate: null,
        TimeAutoSubmit: false,
        BatchMode: false,
        BillServiceRate: 0,
        HCMPayHours: 0,
        AllowDirLbr: true,
        ApprovalPhaseID: '',
        ApprovalProjectDesc: '',
        ApprovalProjectID: '',
        ApprovedBy: '',
        ApprvrHasOpenTask: false,
        BaseCurrCodeDesc: '',
        BurdenCost: 40,
        CapabilityDescription: '',
        CapabilityID: '',
        ChargeRate: 0,
        ChargeRateSRC: '',
        ChgRateCurrDesc: '',
        CompleteFlag: false,
        DiscrepUOM: 'EA',
        DisLaborType: false,
        DisplayJob: 'L01094-L25',
        DisPrjRoleCd: false,
        DisTimeTypCd: true,
        DowntimeTotal: 0,
        DspChangeTime: '16:21',
        DspCreateTime: '16:21',
        DspTotHours: '',
        DtClockIn: null,
        DtClockOut: null,
        EfficiencyPercentage: 0,
        EmployeeName: '',
        EnableComplete: true,
        EnableCopy: true,
        EnableDiscrepQty: true,
        EnableInspection: false,
        EnableLaborQty: true,
        EnableNextOprSeq: false,
        EnablePrintTagsList: false,
        EnableRecall: false,
        EnableRecallAprv: false,
        EnableRequestMove: false,
        EnableResourceGrpID: false,
        EnableScrapQty: true,
        EnableSN: false,
        EnableSubmit: false,
        EndActivity: false,
        EnteredOnCurPlant: true,
        FSComplete: false,
        GLTranAmt: 0,
        GLTranDate: null,
        HasAccessToRow: true,
        HasComments: false,
        ISFixHourAndQtyOnly: false,
        JCSystReworkReasons: true,
        JCSystScrapReasons: false,
        JobOperComplete: false,
        JobType: 'Manufacture',
        JobTypeCode: 'MFG',
        LaborCost: 25.9,
        LaborUOM: 'EA',
        LbrDay: '',
        LbrMonth: '',
        LbrWeek: '',
        MES: false,
        MultipleEmployeesText: '',
        NewDifDateFlag: 0,
        NewPrjRoleCd: '',
        NewRoleCdDesc: '',
        NextAssemblySeq: 0,
        NextOperDesc: '',
        NextOprSeq: 0,
        NextResourceDesc: '',
        NonConfProcessed: false,
        NotSubmitted: true,
        OkToChangeResourceGrpID: false,
        PartDescription: '',
        PartNum: '',
        PBAllowModify: false,
        PendingApprovalBy: '',
        PhaseJobNum: '',
        PhaseOprSeq: 0,
        PrintNCTag: false,
        PrjUsedTran: '',
        ProdDesc: 'Production',
        ProjPhaseID: '',
        RequestMove: false,
        ResourceDesc: '',
        RoleCdDisplayAll: false,
        ScrapUOM: 'EA',
        SentFromMES: false,
        StartActivity: false,
        TimeDisableDelete: false,
        TimeDisableUpdate: false,
        TreeNodeImageName: 'Entered',
        UnapprovedFirstArt: false,
        WeekDisplayText: '11/26/2017 - 12/2/2017',
        ApprovalPhaseDesc: '',
        BitFlag: 0,
        DiscrpRsnDescription: '',
        EmpBasicLastName: 'Sheet',
        EmpBasicFirstName: 'Time',
        EmpBasicName: 'Time Sheet',
        ExpenseCodeDescription: 'Main',
        HCMIntregationHCMEnabled: false,
        HCMStatusStatus: '',
        IndirectDescription: '',
        JCDeptDescription: 'Electrical Production',
        JobAsmblDescription: 'Al Hab - Site Installation',
        MachineDescription: '',
        OpCodeOpDesc: 'Electrical Assembly',
        OpDescOpDesc: 'Electrical Assembly',
        PayMethodType: 0,
        PayMethodSummarizePerCustomer: false,
        PayMethodName: '',
        PhaseIDDescription: '',
        ProjectDescription: '',
        ResourceGrpDescription: 'Electrical Production',
        ResReasonDescription: '',
        ReWorkReasonDescription: '',
        RoleCdRoleDescription: '',
        ScrapReasonDescription: '',
        ShiftDescription: 'First Shift',
        TimeTypCdDescription: '',
        RowMod: '',
        Character01: '',
        EmpCostCenter_c: 'C29',
        Number01: 0,
        ShortChar01: '',
        TSheetsID_c: 0,
        UD_SysRevID: 'AAAAAEUlw3I='
      },
      {
        Company: '700',
        EmployeeNum: 'TS',
        LaborHedSeq: 715628,
        LaborDtlSeq: 2179556,
        LaborType: 'P',
        LaborTypePseudo: 'P',
        ReWork: false,
        ReworkReasonCode: '',
        JobNum: 'ICLDEL_W44Y16',
        AssemblySeq: 0,
        OprSeq: 20,
        JCDept: 'RGATMENG',
        ResourceGrpID: 'RGATMENG',
        OpCode: 'OPELEINT',
        LaborHrs: 1,
        BurdenHrs: 1,
        LaborQty: 0,
        ScrapQty: 0,
        ScrapReasonCode: '',
        SetupPctComplete: 0,
        Complete: false,
        IndirectCode: '',
        LaborNote: '',
        ExpenseCode: 'MAIN',
        LaborCollection: false,
        AppliedToSchedule: false,
        ClockInMInute: 33702240,
        ClockOutMinute: 33702780,
        ClockInDate: '2017-11-28T00:00:00',
        ClockinTime: 8,
        ClockOutTime: 17,
        ActiveTrans: false,
        OverRidePayRate: 0,
        LaborRate: 0,
        BurdenRate: 20,
        DspClockInTime: '08:00',
        DspClockOutTime: '17:00',
        ResourceID: '',
        OpComplete: false,
        EarnedHrs: 0,
        AddedOper: false,
        PayrollDate: '2017-11-28T00:00:00',
        PostedToGL: false,
        FiscalYear: 0,
        FiscalPeriod: 0,
        JournalNum: 0,
        GLTrans: true,
        JournalCode: '',
        InspectionPending: false,
        CallNum: 0,
        CallLine: 0,
        ServNum: 0,
        ServCode: '',
        ResReasonCode: '',
        WipPosted: false,
        DiscrepQty: 0,
        DiscrpRsnCode: '',
        ParentLaborDtlSeq: 0,
        LaborEntryMethod: 'T',
        FiscalYearSuffix: '',
        FiscalCalendarID: '',
        BFLaborReq: false,
        ABTUID: '',
        ProjectID: 'ICLDEL',
        PhaseID: '',
        RoleCd: '',
        TimeTypCd: '',
        PBInvNum: 0,
        PMUID: 0,
        TaskSetID: '',
        ApprovedDate: null,
        ClaimRef: '',
        QuickEntryCode: '',
        TimeStatus: 'E',
        CreatedBy: 'Timesheet',
        CreateDate: '2017-11-29T00:00:00',
        CreateTime: 59004,
        ChangedBy: 'Timesheet',
        ChangeDate: '2017-11-29T00:00:00',
        ChangeTime: 59004,
        ActiveTaskID: '',
        LastTaskID: '',
        CreatedViaTEWeekView: false,
        CurrentWFStageID: '',
        WFGroupID: '',
        WFComplete: false,
        ApprovalRequired: false,
        SubmittedBy: '',
        PBRateFrom: '',
        PBCurrencyCode: '',
        PBHours: 0,
        PBChargeRate: 0,
        PBChargeAmt: 0,
        DocPBChargeRate: 0,
        Rpt1PBChargeRate: 0,
        Rpt2PBChargeRate: 0,
        Rpt3PBChargeRate: 0,
        DocPBChargeAmt: 0,
        Rpt1PBChargeAmt: 0,
        Rpt2PBChargeAmt: 0,
        Rpt3PBChargeAmt: 0,
        Shift: 1,
        ActID: 0,
        DtailID: 0,
        ProjProcessed: false,
        AsOfDate: null,
        AsOfSeq: 0,
        JDFInputFiles: '',
        JDFNumberOfPages: '',
        BatchWasSaved: '',
        AssignToBatch: false,
        BatchComplete: false,
        BatchRequestMove: false,
        BatchPrint: false,
        BatchLaborHrs: 0,
        BatchPctOfTotHrs: 0,
        BatchQty: 0,
        BatchTotalExpectedHrs: 0,
        JDFOpCompleted: '',
        SysRevID: 1160103096,
        SysRowID: 'fd081a58-65cc-4fd4-8dce-55e4d4e21628',
        Downtime: false,
        RefJobNum: '',
        RefAssemblySeq: 0,
        RefOprSeq: 0,
        Imported: false,
        ImportDate: null,
        TimeAutoSubmit: false,
        BatchMode: false,
        BillServiceRate: 0,
        HCMPayHours: 0,
        AllowDirLbr: true,
        ApprovalPhaseID: '',
        ApprovalProjectDesc: '',
        ApprovalProjectID: '',
        ApprovedBy: '',
        ApprvrHasOpenTask: false,
        BaseCurrCodeDesc: '',
        BurdenCost: 20,
        CapabilityDescription: '',
        CapabilityID: '',
        ChargeRate: 0,
        ChargeRateSRC: '',
        ChgRateCurrDesc: '',
        CompleteFlag: false,
        DiscrepUOM: 'EA',
        DisLaborType: false,
        DisplayJob: 'ICLDEL_W44Y16',
        DisPrjRoleCd: false,
        DisTimeTypCd: true,
        DowntimeTotal: 0,
        DspChangeTime: '16:23',
        DspCreateTime: '16:23',
        DspTotHours: '',
        DtClockIn: null,
        DtClockOut: null,
        EfficiencyPercentage: 0,
        EmployeeName: '',
        EnableComplete: true,
        EnableCopy: true,
        EnableDiscrepQty: true,
        EnableInspection: false,
        EnableLaborQty: true,
        EnableNextOprSeq: false,
        EnablePrintTagsList: false,
        EnableRecall: false,
        EnableRecallAprv: false,
        EnableRequestMove: false,
        EnableResourceGrpID: false,
        EnableScrapQty: true,
        EnableSN: false,
        EnableSubmit: false,
        EndActivity: false,
        EnteredOnCurPlant: true,
        FSComplete: false,
        GLTranAmt: 0,
        GLTranDate: null,
        HasAccessToRow: true,
        HasComments: false,
        ISFixHourAndQtyOnly: false,
        JCSystReworkReasons: true,
        JCSystScrapReasons: false,
        JobOperComplete: false,
        JobType: 'Manufacture',
        JobTypeCode: 'MFG',
        LaborCost: 12.95,
        LaborUOM: 'EA',
        LbrDay: '',
        LbrMonth: '',
        LbrWeek: '',
        MES: false,
        MultipleEmployeesText: '',
        NewDifDateFlag: 0,
        NewPrjRoleCd: '',
        NewRoleCdDesc: '',
        NextAssemblySeq: 0,
        NextOperDesc: '',
        NextOprSeq: 0,
        NextResourceDesc: '',
        NonConfProcessed: false,
        NotSubmitted: true,
        OkToChangeResourceGrpID: false,
        PartDescription: '',
        PartNum: '',
        PBAllowModify: false,
        PendingApprovalBy: '',
        PhaseJobNum: '',
        PhaseOprSeq: 0,
        PrintNCTag: false,
        PrjUsedTran: '',
        ProdDesc: 'Production',
        ProjPhaseID: '',
        RequestMove: false,
        ResourceDesc: '',
        RoleCdDisplayAll: false,
        ScrapUOM: 'EA',
        SentFromMES: false,
        StartActivity: false,
        TimeDisableDelete: false,
        TimeDisableUpdate: false,
        TreeNodeImageName: 'Entered',
        UnapprovedFirstArt: false,
        WeekDisplayText: '11/26/2017 - 12/2/2017',
        ApprovalPhaseDesc: '',
        BitFlag: 0,
        DiscrpRsnDescription: '',
        EmpBasicLastName: 'Sheet',
        EmpBasicFirstName: 'Time',
        EmpBasicName: 'Time Sheet',
        ExpenseCodeDescription: 'Main',
        HCMIntregationHCMEnabled: false,
        HCMStatusStatus: '',
        IndirectDescription: '',
        JCDeptDescription: 'Automation Engineering',
        JobAsmblDescription: 'Week 44 Interco Rechg to DEL',
        MachineDescription: '',
        OpCodeOpDesc: 'Electrical Site Install',
        OpDescOpDesc: 'Electrical Site Install',
        PayMethodType: 0,
        PayMethodSummarizePerCustomer: false,
        PayMethodName: '',
        PhaseIDDescription: '',
        ProjectDescription: '',
        ResourceGrpDescription: 'Automation Engineering',
        ResReasonDescription: '',
        ReWorkReasonDescription: '',
        RoleCdRoleDescription: '',
        ScrapReasonDescription: '',
        ShiftDescription: 'First Shift',
        TimeTypCdDescription: '',
        RowMod: '',
        Character01: '',
        EmpCostCenter_c: 'C29',
        Number01: 0,
        ShortChar01: '',
        TSheetsID_c: 0,
        UD_SysRevID: 'AAAAAEUlw9U='
      }
    ],
    LaborDtlAttch: [],
    LaborDtlComment: [],
    LaborEquip: [],
    LaborPart: [],
    LbrScrapSerialNumbers: [],
    LaborDtlGroup: [],
    SelectedSerialNumbers: [],
    SNFormat: [],
    TimeWeeklyView: [],
    TimeWorkHours: []
  },
  parameters: {
    morePages: false
  }
});
