import LeftSideBar from "./Reusable/LeftSideBar";
import SharedMain from "./Shared/SharedMain";

export default function Shared (){
    return(
        <div className="flex flex-row bg-slate-200 w-full">
            <LeftSideBar/>
            <SharedMain />
        </div>
    )
}