const { create, fragment } = require('xmlbuilder2');
const pgStructure = require('pg-structure').default;
fs = require('fs');

const namespace = "ZWORKREPORT_ODATA_SRV"
const doc = create().ele("xmlns:edmx").att(
  {
    "xmlns:edmx": "http://schemas.microsoft.com/ado/2007/06/edmx",
    "xmlns:m": "http://schemas.microsoft.com/ado/2007/08/dataservices/metadata",
    "xmlns:sap": "http://www.sap.com/Protocols/SAPData",
    "Version": "1.0"
  });

const dataServices = fragment().ele("edmx:DataServices").att({ "m:DataServiceVersion": "2.0" })
const scheme = fragment().ele("Schema").att({
  xmlns: "http://schemas.microsoft.com/ado/2008/09/edm",
  Namespace: namespace,
  "xml:lang": "en",
  "sap:schema-version": "1"
});

pgStructure({ database: "mydb", user: "toadslop", password: "newPassword" }, { includeSchemas: ["public"] }).then(db => {
  const tables = db.tables;

  tables.forEach((table) => {
    if (table.name === "migrations") {
      return;
    }
    const entity = fragment().ele("EntityType").att({ name: table.name, "sap:content-version": "1" })
    table.primaryKey.columns.forEach((column) => {
      const key = fragment().ele("key").ele("PropertRef").att({ Name: column.name }).up();
      entity.import(key);
    })
    table.columns.forEach((column) => {
      console.log(column)
      const attributes = {
        Name: column.name,
        Type: toEdmType(column.type.internalName),
        Nullable: !column.notNull,
        "sap:unicode": false,
        "sap:label": column.comment || column.name,
        "sap:creatable": false,
        "sap:updatable": false,
        "sap:sortable": false,
        "sap:filterable": false
      }
      if (column.length) {
        attributes["MaxLength"] = column.length
      }
      const property = fragment().ele("Property").att(attributes).up()
      entity.import(property)
    })
    scheme.import(entity);
  })

  dataServices.import(scheme);
  doc.import(dataServices);
  const xml = doc.end({ prettyPrint: true });
  console.log(xml);
})

const toEdmType = (sPgDatatype) => {
  switch (sPgDatatype.toLowerCase()) {
    case "bigint":
      return "Edm.Int64"
    case "binary":
      return "Edm.Binary"
    case "bit":
      return "Edm.Boolean"
    case "boolean":
      return "Edm.Boolean"
    case "char":
      return "Edm.String"
    case "date":
      return "Edm.Date"
    case "decimal":
      return "Edm.Decimal"
    case "double":
      return "Edm.Double"
    case "float":
      return "Edm.Double"
    case "integer":
      return "Edm.Int32"
    case "int4":
      return "Edm.Int32"
    case "longvarbinary":
      return "Edm.Binary"
    case "longvarchar":
      return "Edm.String"
    case "real":
      return "EdmSingle"
    case "smallint":
      return "Edm.Int16"
    case "time":
      return "Edm.TimeOfDay"
    case "timestamp":
      return "Edm.DateTimeOffset"
    case "tinyint":
      return "Edm.Byte"
    case "varbinary":
      return "Edm.Binary"
    case "varchar":
      return "Edm.String"
    default:
      throw new Error(`Datatype ${sPgDatatype} is not a valid Postgres Datatype`)
  }
}
// fs.writeFile("metadata.xml", doc)

const xmlStr = `
<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx"
  xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata"
  xmlns:sap="http://www.sap.com/Protocols/SAPData" Version="1.0">
  <edmx:DataServices m:DataServiceVersion="2.0">
    <Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="ZWORKREPORT_ODATA_SRV" xml:lang="en" sap:schema-version="1">
      <EntityType Name="WorkReport" sap:content-version="1">
        <Key>
          <PropertyRef Name="Entryid"/>
        </Key>
        <Property Name="Dateedit" Type="Edm.String" Nullable="false" MaxLength="14" sap:unicode="false" sap:label="Date Edit" sap:creatable="false" sap:updatable="false" sap:sortable="false" sap:filterable="false"/>
        <Property Name="RecStart" Type="Edm.String" Nullable="false" MaxLength="14" sap:unicode="false" sap:label="Start Date" sap:creatable="false" sap:updatable="false" sap:sortable="false" sap:filterable="false"/>
        <Property Name="Entryid" Type="Edm.String" Nullable="false" MaxLength="6" sap:unicode="false" sap:label="Report ID" sap:creatable="false" sap:updatable="false"/>
        <Property Name="RecEnd" Type="Edm.String" Nullable="false" MaxLength="14" sap:unicode="false" sap:label="End Date" sap:creatable="false" sap:updatable="false" sap:sortable="false" sap:filterable="false"/>
        <Property Name="Userid" Type="Edm.String" Nullable="false" MaxLength="30" sap:unicode="false" sap:label="User ID" sap:creatable="false" sap:updatable="false"/>
        <Property Name="Recdate" Type="Edm.String" Nullable="false" MaxLength="10" sap:unicode="false" sap:label="Date" sap:sortable="false"/>
        <Property Name="Status" Type="Edm.Byte" Nullable="false" sap:unicode="false" sap:label="Status" sap:sortable="false" sap:filterable="false"/>
        <Property Name="Reccomment" Type="Edm.String" sap:unicode="false" sap:label="Comment" sap:sortable="false" sap:filterable="false"/>
        <NavigationProperty Name="UsersSet" Relationship="ZWORKREPORT_ODATA_SRV.Assoc_WorkReport_User" FromRole="FromRole_Assoc_WorkReport_User" ToRole="ToRole_Assoc_WorkReport_User"/>
      </EntityType>
      <EntityType Name="Users" sap:content-version="1">
        <Key>
          <PropertyRef Name="Username"/>
        </Key>
        <Property Name="Username" Type="Edm.String" Nullable="false" MaxLength="12" sap:unicode="false" sap:label="User" sap:creatable="false" sap:updatable="false"/>
        <Property Name="Department" Type="Edm.String" Nullable="false" MaxLength="40" sap:unicode="false" sap:label="Department" sap:creatable="false" sap:updatable="false" sap:sortable="false" sap:filterable="false"/>
        <Property Name="NameFirst" Type="Edm.String" Nullable="false" MaxLength="40" sap:unicode="false" sap:label="First Name" sap:creatable="false" sap:updatable="false"/>
        <Property Name="NameLast" Type="Edm.String" Nullable="false" MaxLength="40" sap:unicode="false" sap:label="Last name" sap:creatable="false" sap:updatable="false"/>
        <NavigationProperty Name="WorkReportSet" Relationship="ZWORKREPORT_ODATA_SRV.Assoc_User_WorkReport" FromRole="FromRole_Assoc_User_WorkReport" ToRole="ToRole_Assoc_User_WorkReport"/>
      </EntityType>
      <Association Name="Assoc_WorkReport_User" sap:content-version="1">
        <End Type="ZWORKREPORT_ODATA_SRV.WorkReport" Multiplicity="1" Role="FromRole_Assoc_WorkReport_User"/>
        <End Type="ZWORKREPORT_ODATA_SRV.Users" Multiplicity="1" Role="ToRole_Assoc_WorkReport_User"/>
      </Association>
      <Association Name="Assoc_User_WorkReport" sap:content-version="1">
        <End Type="ZWORKREPORT_ODATA_SRV.Users" Multiplicity="1" Role="FromRole_Assoc_User_WorkReport"/>
        <End Type="ZWORKREPORT_ODATA_SRV.WorkReport" Multiplicity="*" Role="ToRole_Assoc_User_WorkReport"/>
        <ReferentialConstraint>
          <Principal Role="FromRole_Assoc_User_WorkReport">
            <PropertyRef Name="Username"/>
          </Principal>
          <Dependent Role="ToRole_Assoc_User_WorkReport">
            <PropertyRef Name="Userid"/>
          </Dependent>
        </ReferentialConstraint>
      </Association>
      <EntityContainer Name="ZWORKREPORT_ODATA_SRV_Entities" m:IsDefaultEntityContainer="true" sap:supported-formats="atom json xlsx">
        <EntitySet Name="WorkReportSet" EntityType="ZWORKREPORT_ODATA_SRV.WorkReport" sap:deletable="false" sap:searchable="true" sap:pageable="false" sap:content-version="1"/>
        <EntitySet Name="UsersSet" EntityType="ZWORKREPORT_ODATA_SRV.Users" sap:creatable="false" sap:updatable="false" sap:deletable="false" sap:searchable="true" sap:pageable="false" sap:content-version="1"/>
        <AssociationSet Name="Assoc_WorkReport_UserSet" Association="ZWORKREPORT_ODATA_SRV.Assoc_User_WorkReport" sap:creatable="false" sap:updatable="false" sap:deletable="false" sap:content-version="1">
          <End EntitySet="UsersSet" Role="FromRole_Assoc_User_WorkReport"/>
          <End EntitySet="WorkReportSet" Role="ToRole_Assoc_User_WorkReport"/>
        </AssociationSet>
        <AssociationSet Name="Assoc_WorkReport_User_AssocSet" Association="ZWORKREPORT_ODATA_SRV.Assoc_WorkReport_User" sap:creatable="false" sap:updatable="false" sap:deletable="false" sap:content-version="1">
          <End EntitySet="WorkReportSet" Role="FromRole_Assoc_WorkReport_User"/>
          <End EntitySet="UsersSet" Role="ToRole_Assoc_WorkReport_User"/>
        </AssociationSet>
      </EntityContainer>
      <atom:link xmlns:atom="http://www.w3.org/2005/Atom" rel="self" href="http://vhcals4hci.dummy.nodomain:50000/sap/opu/odata/SAP/ZWORKREPORT_ODATA_SRV/$metadata"/>
      <atom:link xmlns:atom="http://www.w3.org/2005/Atom" rel="latest-version" href="http://vhcals4hci.dummy.nodomain:50000/sap/opu/odata/SAP/ZWORKREPORT_ODATA_SRV/$metadata"/>
    </Schema>
  </edmx:DataServices>
</edmx:Edmx>
`

// const doc = create(xmlStr);
// console.log(doc)
// const xml = doc.end({ prettyPrint: true });
// console.log(xml);