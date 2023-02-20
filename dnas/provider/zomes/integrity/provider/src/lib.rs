use hdi::prelude::*;

#[hdk_entry_defs]
#[unit_enum(UnitEntryTypes)]
pub enum EntryTypes {
    #[entry_def()]
    ProviderEntry(ProviderEntry),
}
#[hdk_entry_helper]
#[derive(Clone)]
pub struct ProviderEntry {
    pub name: String,
    pub content: String,
}

#[hdk_link_types]
pub enum LinkTypes {
    ProviderLink,
}

#[hdk_extern]
pub fn validate(_op: Op) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}
