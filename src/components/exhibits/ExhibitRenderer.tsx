import type { ExhibitData } from "@/types/exhibit";
import { CLIExhibit } from "./CLIExhibit";
import { TopologyExhibit } from "./TopologyExhibit";
import { TableExhibit } from "./TableExhibit";

export function ExhibitRenderer({ exhibit }: { exhibit: ExhibitData }) {
  switch (exhibit.type) {
    case "cli":
      return <CLIExhibit exhibit={exhibit} />;
    case "topology":
      return <TopologyExhibit exhibit={exhibit} />;
    case "table":
      return <TableExhibit exhibit={exhibit} />;
    case "none":
      return null;
  }
}
